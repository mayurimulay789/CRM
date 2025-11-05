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
- [ ] Step 2: Verify Integration
