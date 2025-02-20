import axiosInstance from "../../configs/axios_instance"

export const fetchUserTasks = async () => {
    try {
        const response = await axiosInstance.get(`/tasks`);
        return response.data;
    } catch (error) {
        return [];
    }
}
export const fetchProjectTasks = async (project_id) => {
    try {
        if (!project_id) {
            return [];
        }
        const response = await axiosInstance.get(`/tasks/project/${project_id}`);
        return response.data;
    } catch (error) {
        return [];
    }
}

export const fetchTeamTasks = async (team_id) => {
    try {
        if (!team_id) {
            return [];
        }
        const response = await axiosInstance.get(`/tasks/team/${team_id}`);
        return response.data;
    } catch (error) {
        return [];
    }
}
export const createTask = async (formData) => {
    try {
        const response = await axiosInstance.post(`/tasks`, formData);
        switch(response.status){
            case 201:
                return { status: 201 };
            default:
                return {status: response.status, error: response.data.error};
        }
    } catch (error) {
        return {error: "Error creating task"};
    }
}
export const updateTask = async (task) => {
    try {
        const response = await axiosInstance.put(`/tasks/${task.task_id}`, task);
        switch(response.status){
            case 200:
                return { status: 200 };
            default:
                return {status: response.status, error: response.data.error};
        }
    } catch (error) {
        return {error: "Error creating task"};
    }
}
export const deleteTaskById = async (task_id) => {
    try {
        await axiosInstance.delete(`/tasks/${task_id}`);
    } catch (error) {
        return {error: "Error creating task"};
    }
}