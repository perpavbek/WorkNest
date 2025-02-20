const userService = require("../services/user_service");
const teamService = require("../services/team_service");
const redisService = require('../services/redis_service');

getUserDtoById = async (req, res) => {
    try{
        const userDto = await userService.getUserDtoById(req.params.user_id);
        if(userDto){
            return res.status(200).send(userDto);
        }
        else{
            return res.status(404).send("User Not Found");
        }
    } catch(err){
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
}

getUserDtoByUsername = async (req, res) => {
    try{
        const userDto = await userService.getUserDtoByUsername(req.params.username);
        if(userDto){
            return res.status(200).send(userDto);
        }
        else{
            return res.status(404).send("User Not Found");
        }
    } catch(err){
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
}

getUserDtosByIds = async (req, res) => {
    try{
        const ids = req.body.ids;
        if(ids){
            const userDtos = await userService.getUserDtosByIds(ids);
            return res.status(200).send(userDtos);
        }
    } catch(err){
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
}

getUserDtosByTeamId = async (req, res) => {
    try{
        const team_id = req.params.team_id;
        const team = await teamService.getTeamDtoById(team_id);
        const ids = team.members;
        const userDtos = await userService.getUserDtosByIds(ids);
        return res.status(200).send(userDtos);
    } catch(err){
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
}

searchUserDtosByUsername = async (req, res) => {
    try{
        const { prompt } = req.body;
        if(!prompt){
            return res.status(200).send([]);
        }
        const userDtos = await userService.searchUserDtosByUsername(prompt);
        return res.status(200).send(userDtos);
    } catch(err){
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
}

deleteUserById = async (req, res) => {
    try{
        const user_id = req.user.data.user_id;
        await userService.deleteUserById(user_id);
        await redisService.deleteRefreshTokenByUserId(user_id);
        return res.status(200).send();
    }
    catch(err){
        switch(err.message){
            case "user_not_exists":
                return res.status(404).send({error: "User Not Found"});
            default:
                console.error(`Error deleting user: ${err}`)
                return res.status(500).send({error: "Internal Server Error"});
        }
    }
}

module.exports = {
    getUserDtoById,
    getUserDtoByUsername,
    getUserDtosByIds,
    getUserDtosByTeamId,
    searchUserDtosByUsername,
    deleteUserById
}