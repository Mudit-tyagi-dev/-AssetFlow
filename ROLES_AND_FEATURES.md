# AssetFlow: Roles & Features Architecture

This document defines the strict Role-Based Access Control (RBAC) boundaries for the AssetFlow Enterprise System. Every feature in the system is gated by these four roles.

---

## 1. Admin
The Admin is the superuser responsible for setting up the foundational data of the organization.

**Features & Capabilities:**
- **Organization Setup:** Can create, edit, and deactivate Departments.
- **Category Management:** Can create and configure Asset Categories (e.g., Electronics, Vehicles).
- **Employee Directory Management:** Can view all employees.
- **Role Assignment:** *Crucially, the Admin is the only role that can promote a standard Employee to a Department Head or Asset Manager.*
- **System Audits:** Can view organization-wide Activity Logs and full system Analytics.

---

## 2. Asset Manager
The Asset Manager is the operational controller of the physical inventory. They handle the physical lifecycle of an asset.

**Features & Capabilities:**
- **Asset Registration:** Can register new assets into the system (generating the `AF-XXXX` tag) and marking them as 'Available'.
- **Allocation Overrides:** Can allocate assets to any employee or department.
- **Transfer Approvals:** Approves or rejects asset transfer requests between employees.
- **Maintenance Workflow:** Receives maintenance requests, approves them, assigns technicians, and marks them as resolved.
- **Returns & Condition Logging:** Processes returning assets and logs condition check-in notes (updating status back to 'Available' or 'Under Maintenance').
- **Audit Resolutions:** Resolves discrepancies flagged during Audit Cycles.

---

## 3. Department Head
The Department Head is a localized manager. Their permissions are scoped strictly to their assigned Department.

**Features & Capabilities:**
- **Departmental Visibility:** Can view all assets currently allocated to their specific department and their direct reports.
- **Intra-department Transfers:** Can approve allocation or transfer requests made by employees within their own department.
- **Resource Booking:** Can book shared resources (conference rooms, vehicles) on behalf of their entire department.
- **Department Analytics:** Views reports and utilization metrics specifically filtered for their department.

---

## 4. Employee (Base Role)
This is the default role assigned to any new user who signs up or joins the organization.

**Features & Capabilities:**
- **Personal Asset Visibility:** Can view the list of assets specifically allocated to them.
- **Resource Booking:** Can book shared resources by time slot (with the system automatically blocking overlapping times).
- **Maintenance Requests:** Can raise a repair/maintenance request for an asset they currently hold (e.g., reporting a broken laptop screen).
- **Transfer/Return Initiation:** Can initiate a transfer request to pass an asset to a coworker, or initiate a return request to hand it back to the Asset Manager.

---

## Onboarding Workflow
Because users cannot select their own roles at signup (to prevent privilege escalation):
1. User signs up via the Signup screen.
2. The system creates their account with the **Employee** role.
3. The **Admin** reviews the Employee Directory, assigns the new user to their respective Department, and promotes them to **Department Head** or **Asset Manager** if their job requires it.
