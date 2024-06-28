import { useEffect, useState } from 'react';
import Styles from './TODO.module.css';
import { dummy } from './dummy';
import axios from 'axios';

export function TODO(props) {
    const [newTodo, setNewTodo] = useState({ title: '', description: '' });
    const [todoData, setTodoData] = useState(dummy);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editingValue, setEditingValue] = useState({ title: '', description: '' });

    useEffect(() => {
        const fetchTodo = async () => {
            const apiData = await getTodo();
            setTodoData(apiData);
            setLoading(false);
        };
        fetchTodo();
    }, []);

    const getTodo = async () => {
        const options = {
            method: 'GET',
            url: 'http://localhost:8000/api/todo',
            headers: {
                accept: 'application/json',
            },
        };
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (err) {
            console.log(err);
            return []; // return an empty array in case of error
        }
    };

    const addTodo = () => {
        const options = {
            method: 'POST',
            url: 'http://localhost:8000/api/todo',
            headers: {
                accept: 'application/json',
            },
            data: newTodo,
        };
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                setTodoData((prevData) => [...prevData, response.data.newTodo]);
                setNewTodo({ title: '', description: '' });
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const deleteTodo = (id) => {
        const options = {
            method: 'DELETE',
            url: `http://localhost:8000/api/todo/${id}`,
            headers: {
                accept: 'application/json',
            },
        };
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                setTodoData((prevData) => prevData.filter((todo) => todo._id !== id));
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const updateTodo = (id) => {
        const options = {
            method: 'PATCH',
            url: `http://localhost:8000/api/todo/${id}`,
            headers: {
                accept: 'application/json',
            },
            data: editingValue,
        };
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                setTodoData((prevData) => prevData.map((todo) => (todo._id === id ? response.data : todo)));
                setEditingId(null);
                setEditingValue({ title: '', description: '' });
            })
            .catch((err) => {
                console.log(err);
            });
    };

    return (
        <div className={Styles.ancestorContainer}>
            <div className={Styles.headerContainer}>
                <h1>Tasks</h1>
                <span>
                    <input
                        className={Styles.todoInput}
                        type="text"
                        name="New Todo"
                        placeholder="Title"
                        value={newTodo.title}
                        onChange={(event) => {
                            setNewTodo({ ...newTodo, title: event.target.value });
                        }}
                    />
                    <input
                        className={Styles.todoInput}
                        type="text"
                        name="New Todo Description"
                        placeholder="Description"
                        value={newTodo.description}
                        onChange={(event) => {
                            setNewTodo({ ...newTodo, description: event.target.value });
                        }}
                    />
                    <button
                        id="addButton"
                        name="add"
                        className={Styles.addButton}
                        onClick={addTodo}
                    >
                        + New Todo
                    </button>
                </span>
            </div>
            <div id="todoContainer" className={Styles.todoContainer}>
                {loading ? (
                    <p style={{ color: 'white' }}>Loading...</p>
                ) : todoData.length > 0 ? (
                    todoData.map((entry) => (
                        <div key={entry._id} className={Styles.todo}>
                            <span className={Styles.infoContainer}>
                                <input
                                    type="checkbox"
                                    checked={entry.done}
                                    onChange={() => {
                                        const options = {
                                            method: 'PATCH',
                                            url: `http://localhost:8000/api/todo/${entry._id}`,
                                            headers: {
                                                accept: 'application/json',
                                            },
                                            data: {
                                                ...entry,
                                                done: !entry.done,
                                            },
                                        };
                                        axios
                                            .request(options)
                                            .then(function (response) {
                                                console.log(response.data);
                                                setTodoData((prevData) =>
                                                    prevData.map((todo) =>
                                                        todo._id === entry._id ? response.data : todo
                                                    )
                                                );
                                            })
                                            .catch((err) => {
                                                console.log(err);
                                            });
                                    }}
                                />
                                {editingId === entry._id ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editingValue.title}
                                            className={Styles.editInput}
                                            onChange={(e) =>
                                                setEditingValue({ ...editingValue, title: e.target.value })
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    updateTodo(entry._id);
                                                }
                                            }}
                                        />
                                        <br></br>
                                        <textarea
                                            value={editingValue.description}
                                            className={Styles.editInput}
                                            onChange={(e) =>
                                                setEditingValue({ ...editingValue, description: e.target.value })
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    updateTodo(entry._id);
                                                }
                                            }}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <span>&nbsp;&nbsp;{entry.title}</span>
                                        <hr></hr>
                                        <div>{entry.description}</div>
                                    </>
                                )}
                            </span>
                            <span
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    deleteTodo(entry._id);
                                }}
                            >
                                Delete
                            </span>
                            <span
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    setEditingId(entry._id);
                                    setEditingValue({ title: entry.title, description: entry.description });
                                }}
                            >
                                Edit
                            </span>
                        </div>
                    ))
                ) : (
                    <p className={Styles.noTodoMessage}>No tasks available. Please add a new task.</p>
                )}
            </div>
        </div>
    );
}
