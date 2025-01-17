import React from "react";
import { createTask } from "../../../services/api/task_service";
import { getTeamsByProjectId } from "../../../services/api/team_service";
import { getUsersByIds, getUsersByTeamId } from "../../../services/api/user_service";

class CreateTaskModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            statuses: ["To Do", "In Progress", "Completed"],
            formData: {
                name: "",
                project_id: this.props.project.project_id,
                description: "",
                deadline: "",
                status: "To Do",
                priority: "hot",
                assigned_to: null,
                team_id: null,
            },
            teams: null,
            teamMembers: null,
            errorText: "",
        }
    }
    async componentDidMount() {
        if (this.props.project) {
            const teams = await getTeamsByProjectId(this.props.project.project_id);
            this.setState({ teams });
        }

    }
    handleChange = async (e) => {
        const { name, value } = e.target;
        if(name === "team_id"){
            this.setState({teamMembers : await getUsersByTeamId(value)});
        }
        this.setState((prevState) => ({
            formData: {
                ...prevState.formData,
                [name]: value,
            },
        }));
    };

    validateForm = () => {
        return !Object.values(this.state.formData).some(value => value === null || value === undefined || value === "");
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        console.log(this.state.formData);
        if (this.props.project) {
            await this.setState((prevState) => ({
                formData: {
                    ...prevState.formData,
                },
            }));
        }
        if (this.validateForm()) {
            const result = await createTask(this.state.formData);
            switch (result.status) {
                case 201:
                    this.props.onClose();
                    break;
                default:
                    this.setState({ errorText: result.error });
            }
        }
        else {
            this.setState({ errorText: "Fill all labels" });
        }
    };
    render() {
        const { project } = this.props;
        const { teams, teamMembers } = this.state;
        const { team_id } = this.state.formData;
        
        if (!this.props.isActive) {
            return null;
        }
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <button
                        className="btn close-btn"
                        onClick={this.props.onClose}
                    >
                        X
                    </button>
                    <h1>Create Task</h1>
                    <form onSubmit={this.handleSubmit}>
                        <div className="input-field input-text-field">
                            <label>Task name</label>
                            <br />
                            <input
                                type="text"
                                value={this.state.formData.name}
                                name="name"
                                onChange={this.handleChange}
                            />
                            <br />
                        </div>
                        <div className="input-field input-text-field">
                            <label>Task description</label>
                            <br />
                            <textarea
                                name="description"
                                value={this.state.formData.description}
                                rows="5"
                                onChange={this.handleChange}
                            />
                            <br />
                        </div>
                        {project &&
                            <div className="input-field">
                                <label>Select team</label>
                                <br />
                                <select
                                    name="team_id"
                                    value={null}
                                    onChange={this.handleChange}
                                >
                                    <option key={0} value={null}>
                                        
                                    </option>
                                    {teams.map((team, index) => (
                                        <option key={index} value={team.team_id}>
                                            {team.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        }
                        {team_id &&
                            <div className="input-field">
                            <label>Select user</label>
                            <br />
                            <select
                                name="assigned_to"
                                value={null}
                                onChange={this.handleChange}
                            >
                                <option key={0} value={null}>
                                        
                                </option>
                                {teamMembers.map((user, index) => (
                                    <option key={index} value={user.user_id}>
                                        {user.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                        }
                        <div className="input-field">
                            <label>Select deadline</label>
                            <br />
                            <input
                                type="datetime-local"
                                value={this.state.formData.deadline}
                                name="deadline"
                                onChange={this.handleChange}
                            />
                        </div>
                        <div className="input-field">
                            <label>Select status</label>
                            <br />
                            <select
                                name="status"
                                value={this.state.formData.status}
                                onChange={this.handleChange}
                            >
                                {this.state.statuses.map((status, index) => (
                                    <option key={index} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <input type="submit" value="Create Task" className="submit-btn btn" />
                    </form>
                </div>
            </div>
        )
    }
}

export default CreateTaskModal;
