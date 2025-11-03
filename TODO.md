# TODO for DemoManagement Feature

- [x] Create DemoManagement component in client/src/components/DemoManagement.jsx with class type options (Online, Offline, 1-2-1, Live) and a form for demo details (Sr.No, Course, Date, Timing, Mode, Medium, Trainer)
- [x] Update client/src/App.jsx to import and render DemoManagement component
- [x] Create backend model for Demo in server/src/models/Demo.js using Mongoose
- [x] Create routes for demos in server/src/routes/demos.js with POST endpoint to save demo data
- [x] Update server/src/index.js to import and use the demos routes
- [x] Test the integration by running the server and client, and submitting the form (Server running on port 5000, Client on port 5174, .env created with MONGO_URI)
