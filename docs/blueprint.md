# **App Name**: QuoteCraft

## Core Features:

- Create New Quote: Allows users to create new quotes by selecting products with descriptions, dimensions, and prices.
- Open Existing Quote: Enables users to view, edit, and manage existing quotes stored as JSON files, with timestamped naming for easy identification.
- Generate PDF Quote: Provides functionality to print quotes as PDFs, including company details and a detailed product list.

## Style Guidelines:

- Primary color: Soft blue (#ADD8E6) to convey trust and reliability.
- Secondary color: Light grey (#E0E0E0) for a clean and professional look.
- Accent: Teal (#008080) for call-to-action buttons and highlights.
- Clean, well-organized layout with clear sections for easy navigation.
- Use modern, minimalist icons to represent different products and actions.

## Original User Request:
This is an app for a glass company to create quotes.
App Development Plan for Glass Company

1. **Quote Creation and Management:**
   - The app will allow users to create new quotes by selecting products from a predefined list or manually entering custom items.
   - Each product entry will include:
     - Product description
     - Square footage price
     - Dimensions (feet and inches)
     - Calculated cost

2. **User Interface:**
   - A landing page with three primary options:
     - **Create New Quote:** Initiates the quote creation process.
     - **Open Existing Quote:** Displays a list of saved quotes for editing or review.
     - **Configure Product List:** Manages and updates product details stored in JSON format.

3. **Data Storage:**
   - Quotes will be saved locally in JSON format within a designated 'quotes' directory on the web server.
   - Product configurations will also be stored as JSON files for easy updates and management.

4. **Printing Functionality:**
   - Upon finalizing a quote, users can generate a PDF version that includes:
     - Company name
     - Company logo
     - Company address
     - Detailed list of products with descriptions, dimensions, prices, and total costs
   - This ensures a professional presentation suitable for client delivery.

5. **Error Handling and Validation:**
   - The app will include data validation to ensure only positive numbers are entered for dimensions and prices.
   - Clear error messages will guide users if required fields are missing or incorrectly formatted.

6. **Backup and Archiving:**
   - A daily backup feature will automatically archive the 'quotes' directory, ensuring that all data is safely stored and retrievable in case of system issues.

7. **Branding Consistency:**
   - The company logo will be prominently displayed on every page.
   - A consistent color palette aligned with the company's branding will be used throughout the app to maintain a professional appearance.

8. **Manual Entry Functionality:**
   - Users can manually enter special items not listed in the product configuration by providing:
     - Description
     - Price
     - Quantity

9. **Quote Organization and Naming:**
   - Each saved quote file will be named with a timestamp (date and time) to ensure uniqueness and easy identification.
   - All quotes will reside in a single directory for simplicity and ease of access.

10. **Daily Backup Implementation:**
    - The backup feature will run automatically at a specified time each day, creating an archive of the 'quotes' directory.
    - This ensures that all quote data is securely stored and can be restored if necessary.

By following this plan, the app will provide a seamless experience for users to create, edit, save, and print quotes while maintaining data integrity and aligning with the company's branding standards.
  