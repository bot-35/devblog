export function playById(id) {
    // Iterate over the domArray
    for (let i = 0; i < tsParticles._loader._engine._domArray.length; i++) {
        // Check if the current object's id matches the provided id
        if (tsParticles._loader._engine._domArray[i].id === id) {
            // If it does, call the play function on it
            tsParticles._loader._engine._domArray[i].play();
            break; // Exit the loop as we've found the correct object
        }
    }
}
