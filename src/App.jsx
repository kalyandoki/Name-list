import axios from "axios";
import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import "tailwindcss/tailwind.css";

const API_URL = "http://localhost:5000/tasks";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState("");
  const [money, setMoney] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  // Fetch tasks from backend
  useEffect(() => {
    axios.get(API_URL).then((response) => setTasks(response.data));
  }, []);

  const addTask = () => {
    if (name && money) {
      axios
        .post(API_URL, { name, money })
        .then((response) => setTasks([...tasks, response.data]));
      setName("");
      setMoney("");
    }
  };

  const deleteTask = (id) => {
    axios
      .delete(`${API_URL}/${id}`)
      .then(() => setTasks(tasks.filter((task) => task.id !== id)));
  };

  const toggleStatus = (id) => {
    const task = tasks.find((task) => task.id === id);
    const updatedStatus = task.status === "Paid" ? "Unpaid" : "Paid";
    axios
      .put(`${API_URL}/${id}`, { ...task, status: updatedStatus })
      .then((response) => {
        setTasks(tasks.map((t) => (t.id === id ? { ...response.data } : t)));
      });
  };

  const editTask = (task) => {
    setIsEditing(true);
    setCurrentTask(task);
    setName(task.name);
    setMoney(task.money);
  };

  const saveTask = () => {
    axios
      .put(`${API_URL}/${currentTask.id}`, { ...currentTask, name, money })
      .then((response) => {
        setTasks(
          tasks.map((task) =>
            task.id === currentTask.id ? { ...response.data } : task
          )
        );
        setIsEditing(false);
        setName("");
        setMoney("");
        setCurrentTask(null);
      });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Paid/Unpaid List", 10, 10);
    tasks.forEach((task, index) => {
      doc.text(
        `${index + 1}. ${task.name} - $${task.money} - ${task.status}`,
        10,
        20 + index * 10
      );
    });
    doc.save("tasks.pdf");
  };

  return (
    // Same UI code as before
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-transparent p-6 shadow-lg rounded-md">
        <h1 className="text-3xl text-green-400 font-bold mb-4 text-center">
          Pakodi Gang List
        </h1>

        <div className="flex flex-col items-center gap-3">
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 w-full border rounded"
          />
          <input
            type="number"
            placeholder="Enter Money"
            value={money}
            onChange={(e) => setMoney(e.target.value)}
            className="p-2 w-full border rounded"
          />
          {!isEditing ? (
            <button
              onClick={addTask}
              className="bg-blue-500 w-1/2  text-white p-2 rounded"
            >
              Add
            </button>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={saveTask}
                className="bg-green-500 text-white p-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-red-500 text-white p-2 rounded"
              >
                Cancel
              </button>
            </div>
          )}
          <button
            onClick={generatePDF}
            className="bg-gray-800 w-1/2 text-white p-2 rounded"
          >
            Save as PDF
          </button>
        </div>

        <div className="mt-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex justify-between items-center p-4 bg-gray-50 border rounded mb-2"
            >
              <div>
                <h3 className="font-semibold">{task.name}</h3>
                <p>Rs {task.money}</p>
                <p
                  className={`${
                    task.status === "Paid" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {task.status}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleStatus(task.id)}
                  className={`p-2 rounded ${
                    task.status === "Paid" ? "bg-green-200" : "bg-red-200"
                  }`}
                >
                  {task.status === "Paid" ? "Unpaid" : "Paid"}
                </button>
                <button
                  onClick={() => editTask(task)}
                  className="bg-yellow-300 p-2 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="bg-red-400 p-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
