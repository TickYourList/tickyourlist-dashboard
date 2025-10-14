# FAQ Editor Implementation Summary

## Overview
Successfully integrated a rich text editor (React Draft WYSIWYG) for FAQ questions and answers with full CRUD functionality.

## Changes Made

### 1. Editor Component (`src/pages/Content-marketing/Editor.js`)
- **Fixed**: Removed unused `safeValue` variable
- **Fixed**: Removed unused `htmlToEditorState` function
- **Features**:
  - Converts HTML to Draft.js content and vice versa
  - Handles empty states properly
  - Supports controlled component pattern

### 2. Routes (`src/routes/index.js`)
- **Added**: Edit route for FAQs by cityCode
  ```javascript
  { path: "/edit-faqs/:cityCode", component: <FaqsForm /> }
  ```

### 3. API URLs (`src/helpers/locationManagement_url_helpers.js`)
- **Updated**: Get FAQ list endpoint (fetches all FAQs)
  ```javascript
  export const GET_FAQS_LIST = "/v1/tyltravelfaqs/list/all";
  ```
- **Added**: Get FAQs by city code endpoint
  ```javascript
  export const GET_FAQS_BY_CITY = "/v1/tyltravelfaqs/city/"; // cityCode appended
  ```
- **Added**: Get FAQ by ID endpoint
  ```javascript
  export const GET_FAQ_BY_ID = "/v1/tyltravelfaqs/get/"; // ID appended
  ```
- **Added**: Update FAQ endpoint
  ```javascript
  export const UPDATE_FAQS = "/v1/tyltravelfaqs/update/"; // ID appended
  ```

### 4. API Helper (`src/helpers/location_management_helper.js`)
- **Added**: Get FAQs by city function
  ```javascript
  const getFaqsByCity = (cityCode) => get(url.GET_FAQS_BY_CITY + cityCode);
  ```
- **Added**: Get FAQ by ID function
  ```javascript
  const getFaqById = (id) => get(url.GET_FAQ_BY_ID + id);
  ```
- **Added**: Update FAQ function with ID in URL path
  ```javascript
  const updateFaqs = (id, faqData) => put(url.UPDATE_FAQS + id, faqData);
  ```
- **Exported**: `getFaqsByCity`, `getFaqById`, `updateFaqs` functions

### 5. Redux Action Types (`src/store/faqs/actionTypes.js`)
- **Added**:
  - `UPDATE_FAQS`
  - `UPDATE_FAQS_SUCCESS`
  - `UPDATE_FAQS_FAIL`

### 6. Redux Actions (`src/store/faqs/actions.js`)
- **Added**:
  - `updateFaqs(faq)` - Trigger update
  - `updateFaqsSuccess(faq)` - Handle success
  - `updateFaqsFail(error)` - Handle failure

### 7. Redux Saga (`src/store/faqs/saga.js`)
- **Added**: `onUpdateFaqs` saga function
  - Extracts ID from payload
  - Calls API with ID in URL and data in body
  - Handles success/error responses
- **Added**: Watcher for `UPDATE_FAQS` action

### 8. Redux Reducer (`src/store/faqs/reducer.js`)
- **Added**: Handlers for update actions
  - `UPDATE_FAQS`: Set loading state
  - `UPDATE_FAQS_SUCCESS`: Update FAQ in state
  - `UPDATE_FAQS_FAIL`: Set error state

### 9. FAQ Form (`src/pages/Content-marketing/FaqsForm.js`)
- **Added**: Searchable city dropdown with React Select
  - Fetches cities from `getCitiesList()` API
  - Displays cities with format: "City Name (CITY_CODE)"
  - Fully searchable/typeable - type to filter cities
  - Uses cityCode as the value
  - Shows loading state while fetching
  - Clearable option
- **Added**: FAQ details fetching on edit by cityCode
  - Route parameter: `/edit-faqs/:cityCode`
  - Calls `getFaqsByCity(cityCode)` when editing
  - Loads city and all FAQ questions/answers into editor
  - Shows loading spinner while fetching
  - Handles errors gracefully
  - **Smart city dropdown population**: Waits for cities list to load before setting selected city
- **Fixed**: Form initialization
  - Properly loads FAQs from API when editing (not from Redux)
  - Initializes with one empty row for new FAQs
  - Handles edge cases (no FAQs, empty data)
  - Separate useEffect to populate city dropdown after both FAQ data and cities list are loaded
- **Fixed**: Payload structure
  - Correctly formats for both create and update
  - Includes FAQ ID only for updates
  - Extracts cityCode from Select component value
- **Integrated**: Rich text editor for questions and answers
  - Replaces plain text inputs
  - Preserves HTML formatting
  - Supports all editor features (bold, italic, lists, etc.)
- **Added**: Form validation
  - Submit button disabled when no city selected
  - Submit button disabled while loading
  - Required field indicator on city dropdown
- **Added**: Debug logging for troubleshooting data flow

### 10. Styling (`src/pages/Content-marketing/faqs.scss`)
- **Added**: Editor styling classes
  - `.wrapperClassName` - Border and border-radius
  - `.editorClassName` - Padding and min-height
  - `.toolbarClassName` - Toolbar styling

## API Format

### Create FAQ (POST)
```
POST /v1/tyltravelfaqs/create
{
  "city": "DUBAI",
  "faqs": [
    {
      "question": "What's the best time to visit?",
      "answer": "Spring and Fall are ideal.",
      "status": true
    }
  ]
}
```

### Update FAQ (PUT)
```
PUT /v1/tyltravelfaqs/update/{id}
{
  "city": "DUBAI",
  "faqs": [
    {
      "question": "Updated question?",
      "answer": "Updated answer.",
      "status": true
    }
  ]
}
```

## Features
✅ Rich text editor for questions and answers
✅ HTML content preservation
✅ Add/Edit/Delete FAQ items
✅ Multiple FAQs per city
✅ **Searchable city dropdown** with React Select (type to filter)
✅ Dynamic city selection with cityCode
✅ **Fetch FAQ by cityCode** when clicking edit button
✅ Smart city dropdown population (waits for both data sources)
✅ Loading states for both cities and FAQ details
✅ Status toggle (Published/Not Published)
✅ Proper form validation (required city, disabled states)
✅ Debug logging for data flow validation
✅ No lint errors
✅ Proper routing for edit functionality

## Usage
1. **Add New FAQ**: Navigate to `/add-new-faqs`
2. **Select City**: Type to search/filter cities in the dropdown
3. **Add Questions & Answers**: Use rich text editor for formatting
4. **Edit FAQ**: Click edit button on FAQ list → redirects to `/edit-faqs/{cityCode}`
   - FAQ details automatically loaded from API by cityCode
   - City dropdown automatically populated when cities load
   - Questions and answers populated in rich text editors
   - Check browser console for debug logs showing data flow
5. **Use Editor**: Click in question/answer fields to use rich text formatting
6. **Save**: Submit form to create/update FAQs with cityCode parameter

## Technical Notes
- Editor state managed locally with `useState` and `useEffect`
- HTML conversion handled by `draftjs-to-html` and `html-to-draftjs`
- ID passed in URL path for updates (RESTful)
- **FAQ data fetched directly from API by cityCode** (not from Redux store)
- **City dropdown population**: Uses separate useEffect to wait for both FAQ data and cities list before populating
- React Select provides searchable/filterable dropdown
- Debug console logs to validate data flow
- Proper loading states for better UX
- Proper Redux state management for create/update operations

## Data Flow
1. User clicks Edit button → navigates to `/edit-faqs/{cityCode}`
2. Component loads → fetches cities list and FAQ data in parallel
3. **FAQ data parsing fixed**: API returns `response.data.faqs[0]` (array of FAQ documents)
4. FAQ data stored in state → extracts FAQ ID for updates
5. FAQ rows populated with questions/answers for editor
6. When cities list loads → city dropdown populated from FAQ data
7. User edits → form data updated in state
8. Submit → Redux action dispatched with FAQ ID for update

## API Response Structure
### FAQ by City API: `/v1/tyltravelfaqs/city/{cityCode}`
```json
{
  "statusCode": "10000",
  "data": {
    "faqs": [
      {
        "_id": "68edf1602b3e2685481c947f",
        "cityCode": "BOSTON",
        "city": { "displayName": "Boston", "name": "Boston" },
        "faqs": [
          {
            "_id": "68edf1602b3e2685481c9480",
            "question": "<p>sadasda</p>\n",
            "answer": "<p>sddasdas</p>\n",
            "status": true
          }
        ]
      }
    ]
  }
}
```

### Cities API: `/v1/tyltravelcity/get/travelcity/submitted/all`
```json
{
  "data": {
    "travelCityList": [
      {
        "cityCode": "BOSTON",
        "displayName": "Boston",
        "name": "Boston"
      }
    ]
  }
}
```

