import React, { useState } from 'react';
import './task.css';

const TaskManager: React.FC = () => {
    const [tasks, setTasks] = useState<string[]>([]);
    const [newTask, setNewTask] = useState<string>('');
    const [completedTasks, setCompletedTasks] = useState<number[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);


    // need backend database to store tasks and retrieve them

    const handleAddTask = () => {
        if (newTask.trim()) {
            setTasks([newTask, ...tasks]);
            setNewTask('');
        }
    };

    const handleCompleteTask = (indexToComplete: number) => {
        setCompletedTasks([...completedTasks, indexToComplete]);

        setTimeout(() => {
            setTasks(tasks.filter((_, index) => index !== indexToComplete));
            setCompletedTasks(completedTasks.filter(index => index !== indexToComplete));
        }, 1000);
    };

    const handleDeleteTaskFromModal = (indexToDelete: number) => {
        setTasks(tasks.filter((_, index) => index !== indexToDelete));
    };

    const renderTask = (task: string | null, index: number) => (
        <div key={index} className="task-item">
            {task ? (
                <>
                    <div
                        className={`task-circle ${completedTasks.includes(index) ? 'completed' : ''}`}
                        onClick={() => handleCompleteTask(index)}
                    >
                        {completedTasks.includes(index) && '✔'}
                    </div>
                    <span
                        className={`task-text ${completedTasks.includes(index) ? 'task-completed' : ''}`}
                        title={task} // Shows full task on hover
                    >
                        {task.length > 20 ? `${task.substring(0, 20)}...` : task}
                    </span>
                </>
            ) : (
                <div className="task-empty">&nbsp;&nbsp;&nbsp;&nbsp;</div>

            )}
        </div>
    );

    const showMoreTasks = () => setShowModal(true);
    const hideMoreTasks = () => setShowModal(false);

    return (
        <div className="task-manager-block" style={{
            backgroundColor: '#f9f9f9',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            maxWidth: '300px',
            fontFamily: 'Arial, sans-serif',
            color: '#333',
            position: 'relative'
        }}>
            <div className="task-manager-header">Task Manager</div>

            <div className="task-input-block">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Enter a new task"
                />
                <button className='add-button' onClick={handleAddTask}>Add</button>
            </div>

            <div className="tasks-list">
                {Array.from({ length: 4 }).map((_, index) =>
                    renderTask(tasks[index] || null, index)
                )}
            </div>

            {tasks.length > 4 && (
                <div style={{ textAlign: 'right' }}>
                    <button className="see-more-button" onClick={showMoreTasks}>
                        See More
                    </button>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>All Tasks</h3>
                            <button onClick={hideMoreTasks}>Close</button>
                        </div>
                        <div className="modal-tasks-list">
                            {tasks.map((task, index) => (
                                <div key={index} className="task-item">
                                    <span
                                        className={`task-text ${completedTasks.includes(index) ? 'task-completed' : ''}`}
                                        title={task} 
                                    >
                                        {task.length > 20 ? `${task.substring(0, 20)}...` : task}
                                    </span>
                                    <button className="delete-button" onClick={() => handleDeleteTaskFromModal(index)}>
                                        ✔
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskManager;
