<<<<<<< HEAD
# TODO List for Linking Online Demo Page to Admin Sidebar

## Task: Onlinedemo page link to online demo option in admin sidebar

### Steps to Complete:
1. **Update DemoManagement.jsx**:
   - Accept `activeSection` prop.
   - Import OnlineDemo component from counsellor folder.
   - Add switch statement to render OnlineDemo for 'online-demo' activeSection.
   - Provide fallback for other demo sections.

2. **Verify Integration**:
   - Ensure AdminSidebar 'online-demo' button sets activeSection correctly.
   - Confirm AdminDashboard passes activeSection to DemoManagement.
   - Test that clicking 'Online' in admin sidebar renders the OnlineDemo page.

### Status:
- [x] Step 1: Update DemoManagement.jsx
- [x] Step 2: Verify Integration
=======
# Fix 500 Error in Rejecting Campus Grievances

## Steps to Complete
- [x] Add ID validation in `rejectGrievance` function in `server/controllers/campusGrievanceController.js`
- [x] Add console logging for debugging, similar to `approveGrievance`
- [x] Test the reject functionality by running the server and attempting to reject a grievance
>>>>>>> 82dd13c9f3f4cb37530d734df8ba853deeae7f26
