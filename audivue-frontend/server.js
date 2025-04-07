const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files (but not default index.html)
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// Serve about.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/about.html'));
});

// Optional: fallback route for unmatched paths (like /xyz)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/about.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
