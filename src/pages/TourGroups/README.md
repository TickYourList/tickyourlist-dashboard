# TourGroups

This folder contains components related to Tour Groups management.

## TourGroupVariants.js
A table component to display and manage Tour Group Variants, including actions for editing, managing pricing, viewing bookings, duplicating, and deleting variants.

- **Variant Name**
- **Tour Name** (clickable link)
- **City**
- **Price**
- **Status**
- **Action** (icons for edit, manage pricing, view bookings, duplicate, delete)

Data is fetched from `/v1/tyltraveltourgroupvariant/list`. 

### Here’s how you can test `/v1/tyltraveltourgroupvariant/list` with Postman:

1. **Open Postman.**
2. **Create a new request** (click the "+" tab or "New" > "Request").
3. **Set the request type to `GET`.**
4. **Enter the URL** for your API endpoint.  
   Example (replace with your actual backend URL and port if different):  
   ```
   http://localhost:3000/v1/tyltraveltourgroupvariant/list
   ```
5. **Add headers** if your API requires them (e.g., Authorization, Content-Type).
6. **Click "Send".**
7. **View the response** in the lower section of Postman.

---

**If you want to test other actions (edit, delete, etc.):**
- Change the request type (to POST, PUT, DELETE, etc.).
- Add the required body or parameters as needed by your API.

---

If you want a sample Postman collection or need help with a specific API action, let me know!  
Would you like a step-by-step screenshot guide or a sample Postman export file? 