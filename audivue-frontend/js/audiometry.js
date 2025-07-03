// Import Firestore references at the top of your file
const auth = firebase.auth();
const firestore = firebase.firestore();

// Modify the redirectToResults function
function redirectToResults() {
    // Encode the results data into a URL-safe format for passing to the next page
    let resultData = encodeURIComponent(JSON.stringify(results));
    
    // Save the audiometry results to Firestore
    firestore.collection('Users').doc(auth.currentUser.uid)
      .collection('Audiometry Test').add({
        results: results, // The results array containing frequency/volume data
        timestamp: Date.now() // The timestamp when the results were recorded
    })
    .then(() => {
        console.log('Audiometry results saved'); // Log success if results are saved
        // Redirect to the 'audiometry-results.html' page, passing the result data in the URL
        window.location.href = `audiometry-results.html?data=${resultData}`;
    })
    .catch((error) => {
        console.error('Error saving Audiometry results:', error); // Log error if saving results fails
    });
}

// Wait for the DOM to fully load before adding event listeners and setting up the test
document.addEventListener("DOMContentLoaded", function () {
    // Grab elements by their IDs
    const playButton = document.getElementById("playTone"); // Play tone button
    const yesButton = document.getElementById("yesButton"); // Yes button for hearing the tone
    const noButton = document.getElementById("noButton"); // No button for not hearing the tone
    const frequencyDisplay = document.getElementById("frequency"); // Display element for frequency
    const volumeDisplay = document.getElementById("volume"); // Display element for volume

    // Initialize AudioContext for generating audio tones
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let oscillator, gainNode; // Oscillator for tone and gainNode for volume control

    // List of frequencies to test
    let frequencies = [250, 500, 1000, 2000, 4000, 8000];
    let currentFrequencyIndex = 0; // The current index of the frequency list
    let currentVolume = 20; // Starting volume level
    let results = []; // Array to store the results of the audiometry test
    let isPlaying = false; // Flag to track whether the tone is currently playing

    // Function to start a tone with a given frequency and volume
    function startTone(frequency, volume) {
        stopTone(); // Stop any previously playing tone

        // Create oscillator (tone generator) and gain node (volume control)
        oscillator = audioContext.createOscillator();
        gainNode = audioContext.createGain();

        oscillator.type = "sine"; // Sine wave oscillator type (smooth sound)
        oscillator.frequency.value = frequency; // Set frequency for the tone

        // Adjust the gain based on the volume (linear scale converted to logarithmic scale)
        let gainValue = Math.pow(10, (volume - 80) / 20);
        gainNode.gain.value = gainValue; // Set volume for the tone

        // Connect the oscillator and gainNode to the audio context destination (speakers)
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(); // Start the tone
        isPlaying = true; // Set isPlaying flag to true
    }

    // Function to stop the currently playing tone
    function stopTone() {
        if (oscillator) {
            oscillator.stop(); // Stop the oscillator (tone)
            oscillator.disconnect(); // Disconnect the oscillator from the audio context
            isPlaying = false; // Set isPlaying flag to false
        }
    }

    // Event listener for the playTone button
    playButton.addEventListener("click", () => {
        if (!isPlaying) {
            let frequency = frequencies[currentFrequencyIndex]; // Get the current frequency
            startTone(frequency, currentVolume); // Start the tone with current frequency and volume
            frequencyDisplay.textContent = frequency; // Update the frequency display
            volumeDisplay.textContent = currentVolume; // Update the volume display
        }
    });

    // Event listener for the yesButton (user hears the tone)
    yesButton.addEventListener("click", () => {
        stopTone(); // Stop the tone when user confirms hearing it
        results.push({ frequency: frequencies[currentFrequencyIndex], volume: currentVolume }); // Store the result

        currentFrequencyIndex++; // Move to the next frequency
        currentVolume = 20; // Reset volume to 20 for the next tone

        // Check if there are more frequencies to test
        if (currentFrequencyIndex < frequencies.length) {
            frequencyDisplay.textContent = frequencies[currentFrequencyIndex]; // Display next frequency
            volumeDisplay.textContent = currentVolume; // Reset volume display
        } else {
            redirectToResults(); // If all frequencies are tested, redirect to results page
        }
    });

    // Event listener for the noButton (user doesn't hear the tone)
    noButton.addEventListener("click", () => {
        stopTone(); // Stop the tone when user confirms not hearing it
        if (currentVolume < 80) {
            currentVolume += 10; // Increase volume if user didn't hear the tone
            volumeDisplay.textContent = currentVolume; // Update volume display
            startTone(frequencies[currentFrequencyIndex], currentVolume); // Start tone with higher volume
        } else {
            results.push({ frequency: frequencies[currentFrequencyIndex], volume: "Not Heard" }); // Mark frequency as not heard
            currentFrequencyIndex++; // Move to the next frequency

            // Check if all frequencies have been tested
            if (currentFrequencyIndex >= frequencies.length) {
                redirectToResults(); // Redirect to results page if all frequencies are tested
            } else {
                currentVolume = 20; // Reset volume for the next tone
                frequencyDisplay.textContent = frequencies[currentFrequencyIndex]; // Display next frequency
                volumeDisplay.textContent = currentVolume; // Reset volume display
            }
        }
    });

    // Function to redirect to results page with encoded data
    function redirectToResults() {
        // Calculate the average hearing threshold
        let avgVolume = results
          .filter(r => typeof r.volume === 'number')
          .reduce((sum, r) => sum + r.volume, 0) / results.length;
    
        // Save test results to Firestore
        saveAudiometryResults({
          results: results,
          averageVolume: avgVolume,
          timestamp: Date.now()
        });
    
        // Redirect to results page
        let resultData = encodeURIComponent(JSON.stringify(results));
        window.location.href = `audiometry-results.html?data=${resultData}`;
      }
});
// Example call to save the audiometry results after the test is complete
saveAudiometryResults({
    results: results, // Store the frequency/volume results
    averageVolume: avgDb, // Average volume of all tones
    timestamp: Date.now() // Timestamp when results were saved
});

function redirectToResults() {
    // Calculate the average hearing threshold
    let avgVolume = results
      .filter(r => typeof r.volume === 'number')
      .reduce((sum, r) => sum + r.volume, 0) / results.length;
  
    // Save test results to Firebase
    saveTestResults({
      testName: 'Pure Tone Audiometry',
      score: avgVolume,
      details: {
        results: results,
        frequencies: frequencies
      }
    });
  
    // Redirect to results page
    let resultData = encodeURIComponent(JSON.stringify(results));
    window.location.href = `audiometry-results.html?data=${resultData}`;
  }
