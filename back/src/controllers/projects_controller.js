const projectService = require("../services/project_service");
const teamService = require("../services/team_service");
const taskService = require("../services/task_service");
const userService = require("../services/user_service");

createProject = async (req, res) => {
    try {
        const user_id = req.user.data.user_id;
        const project_attr = req.body;
        project_attr.manager = user_id;
        const projectDto = await projectService.createProject(project_attr);
        await userService.addRoleById(user_id, { name: "PROJECT_MANAGER", project_id: projectDto.project_id });
        return res.status(201).send(projectDto);
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: "Internal Server Error" });
    }
};

getProjectDtoById = async (req, res) => {
    try {
        const projectDto = await projectService.getProjectDtoById(req.params.project_id);
        if (projectDto) {
            return res.status(200).send(projectDto);
        }
        else {
            return res.status(404).send({ error: "Project not found" });
        }
    } catch (err) {
        console.error(err)
        return res.status(500).send({ error: "Internal Server Error" });
    }
}

getProjectDtoByName = async (req, res) => {
    try {
        const projectDto = await projectService.getProjectDtoByName(req.params.name);
        if (projectDto) {
            return res.status(200).send(projectDto);
        }
        else {
            return res.status(404).send({ error: "Project not found" });
        }
    } catch (err) {
        console.error(err)
        return res.status(500).send({ error: "Internal Server Error" });
    }
}

getUserProjectDtos = async (req, res) => {
    try {
        const user_id = req.user.data.user_id;
        const projectIds = [];

        const userRoles = await userService.getRolesById(user_id);
        userRoles.forEach(role => {
            if (role.name === "PROJECT_MANAGER") {
                projectIds.push(role.project_id);
            }
        });

        const projectDtos = await projectService.getProjectDtosByIds(projectIds);
        return res.status(200).send(projectDtos);
    }
    catch (err) {
        console.error(err)
        return res.status(500).send({ error: "Internal Server Error" });
    }
}
deleteProjectById = async (req, res) => {
    try {
        const user_id = req.user.data.user_id;
        const project_id = parseInt(req.params.project_id);
        const userRoles = await userService.getRolesById(user_id);
        const hasPermission = userRoles.some((role) => role.name === "PROJECT_MANAGER" && role.project_id === project_id);
        const teamDtos = await teamService.getTeamDtosByProjectId(project_id);

        if (hasPermission) {
            await taskService.deleteTasksByProjectId(project_id);

            teamDtos.forEach(async(team) => {
                await userService.deleteRoleById(team.lead.user_id, {name: "TEAM_LEAD", team_id: team.team_id});
            });
            
            await teamService.deleteTeamsByProjectId(project_id);
            await projectService.deleteProjectById(project_id);
            await userService.deleteRoleById(user_id, {name: "PROJECT_MANAGER", project_id: project_id});
            return res.status(200).send();
        }
        else {
            return res.status(403).send({ error: "forbidden" });
        }

    } catch (err) {
        switch (err.message) {
            case "project_not_exists":
                return res.status(404).send({ error: "Project Not Found" });
            case "user_not_found":
                return res.status(404).send({ error: "User Not Found" });
            default:
                console.error(`Error deleting project: ${err}`)
                return res.status(500).send({ error: "Internal Server Error" });
        }
    }
};

getProjectStatistics = async (req, res) => {
    try{
        const user_id = req.user.data.user_id;
        const project_id = parseInt(req.params.project_id);

        const userRoles = await userService.getRolesById(user_id);
        const hasPermission = userRoles.some(
            (role) => role.name === "PROJECT_MANAGER" && role.project_id === project_id
        );

        if (!hasPermission) {
            return res.status(403).send({ error: "Forbidden" });
        }

        const project = await projectService.getProjectDtoById(project_id);
        if (!project) {
            return res.status(404).send({ error: "Project Not Found" });
        }

        const tasks = await taskService.getTaskDtosByProjectId(project_id);

        const statusMap = {};
        const priorityMap = {};

        tasks.forEach((task) => {
            statusMap[task.status] = (statusMap[task.status] || 0) + 1;

            priorityMap[task.priority] = (priorityMap[task.priority] || 0) + 1;
        });

        const teams = await teamService.getTeamDtosByProjectId(project_id);

        const teamCounts = await Promise.all(
            teams.map(async (team) => {
                const count = await taskService.getProjectTasksCountByTeamId(project_id, team.team_id);
                return { team_id: team.team_id, count };
            })
        );

        const tasks_count = tasks.length;

        const response = {
            tasks_count,

            teams: {
                teams,
                teams_counts: teamCounts.map((tc) => tc.count),
            },

            statuses: {
                statuses: Object.keys(statusMap),
                statuses_counts: Object.values(statusMap),
            },

            priorities: {
                priorities: Object.keys(priorityMap),
                priorities_counts: Object.values(priorityMap),
            },
        };

        return res.status(200).send(response);
    }catch(err){
        switch (err.message) {
            case "project_not_exists":
                return res.status(404).send({ error: "Project Not Found" });
            case "user_not_found":
                return res.status(404).send({ error: "User Not Found" });
            default:
                console.error(`Error getting project statistics: ${err}`)
                return res.status(500).send({ error: "Internal Server Error" });
        }
    }
};

module.exports = {
    createProject,
    getProjectDtoById,
    getProjectDtoByName,
    getUserProjectDtos,
    deleteProjectById,
    getProjectStatistics,
};