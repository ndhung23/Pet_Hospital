
import { useState } from "react";
import PetList from "./pages/PetList";
import EditPet from "./pages/EditPet";
import "./App.css";

function App() {
    const [selectedPet, setSelectedPet] = useState(null);
    const [refresh, setRefresh] = useState(0);

    const handleUpdated = () => {
        setSelectedPet(null);
        setRefresh(prev => prev + 1);
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>PHMS - Pet Health Management System</h1>
                <p>Pet Profile Management</p>
            </header>

            <main className="app-content">
                {selectedPet ? (
                    <EditPet
                        pet={selectedPet}
                        onCancel={() => setSelectedPet(null)}
                        onUpdated={handleUpdated}
                    />
                ) : (
                    <PetList
                        onEdit={setSelectedPet}
                        refresh={refresh}
                    />
                )}
            </main>

            <footer className="app-footer">
                PHMS © 2026
            </footer>
        </div>
    );
}

export default App;
