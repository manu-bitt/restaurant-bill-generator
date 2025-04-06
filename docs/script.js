// Selected bill items
let billItems = [];

// Custom menu items
let customMenuItems = [];

// DOM Elements
const itemSearch = document.getElementById('itemSearch');
const menuItemsContainer = document.getElementById('menuItemsContainer');
const billItemsContainer = document.getElementById('billItems');
const subtotalElement = document.getElementById('subtotal');
const serviceChargeElement = document.getElementById('serviceCharge');
const discountPercentInput = document.getElementById('discountPercent');
const discountElement = document.getElementById('discount');
const grandTotalElement = document.getElementById('grandTotal');
const printBillBtn = document.getElementById('printBill');
const downloadPdfBtn = document.getElementById('downloadPdf');
const resetBillBtn = document.getElementById('resetBill');
const billDateElement = document.getElementById('bill-date');

// Menu management elements
const manageMenuBtn = document.getElementById('manageMenuBtn');
const menuManagement = document.getElementById('menuManagement');
const newItemName = document.getElementById('newItemName');
const newItemPrice = document.getElementById('newItemPrice');
const itemIsPizza = document.getElementById('itemIsPizza');
const addToMenuBtn = document.getElementById('addToMenuBtn');
const closeMenuManagementBtn = document.getElementById('closeMenuManagementBtn');
const customMenuItemsContainer = document.getElementById('customMenuItems');

// Additional DOM Elements for pizza prices
const regularPriceInput = document.getElementById('regularPriceInput');
const pizzaPriceInputs = document.getElementById('pizzaPriceInputs');
const smallPizzaPrice = document.getElementById('smallPizzaPrice');
const mediumPizzaPrice = document.getElementById('mediumPizzaPrice');
const largePizzaPrice = document.getElementById('largePizzaPrice');

// Initialize the app
function init() {
    // Load custom menu items from localStorage if available
    loadCustomMenuItems();
    
    // Populate menu item cards
    populateMenuItems();
    
    // Set current date
    const now = new Date();
    billDateElement.textContent = `Date: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    
    // Add event listeners
    itemSearch.addEventListener('input', handleItemSearch);
    discountPercentInput.addEventListener('input', updateBillSummary);
    printBillBtn.addEventListener('click', printBill);
    downloadPdfBtn.addEventListener('click', downloadPdf);
    resetBillBtn.addEventListener('click', resetBill);
    
    // Menu management event listeners
    manageMenuBtn.addEventListener('click', () => {
        menuManagement.classList.remove('hidden');
        newItemName.value = '';
        newItemPrice.value = '';
        smallPizzaPrice.value = '';
        mediumPizzaPrice.value = '';
        largePizzaPrice.value = '';
        itemIsPizza.checked = false;
        togglePizzaPriceInputs();
    });
    
    addToMenuBtn.addEventListener('click', addItemToMenu);
    closeMenuManagementBtn.addEventListener('click', () => {
        menuManagement.classList.add('hidden');
    });
    
    // Pizza checkbox event listener
    itemIsPizza.addEventListener('change', togglePizzaPriceInputs);
    
    // Initialize pizza price inputs visibility
    togglePizzaPriceInputs();
}

// Load custom menu items from localStorage
function loadCustomMenuItems() {
    const savedItems = localStorage.getItem('customMenuItems');
    if (savedItems) {
        customMenuItems = JSON.parse(savedItems);
        updateCustomMenuItemsList();
    }
}

// Save custom menu items to localStorage
function saveCustomMenuItems() {
    localStorage.setItem('customMenuItems', JSON.stringify(customMenuItems));
}

// Toggle pizza price inputs visibility
function togglePizzaPriceInputs() {
    if (itemIsPizza.checked) {
        regularPriceInput.classList.add('hidden');
        pizzaPriceInputs.classList.remove('hidden');
        // Clear regular price when switching to pizza
        newItemPrice.value = '';
    } else {
        regularPriceInput.classList.remove('hidden');
        pizzaPriceInputs.classList.add('hidden');
        // Clear pizza prices when switching to regular item
        smallPizzaPrice.value = '';
        mediumPizzaPrice.value = '';
        largePizzaPrice.value = '';
    }
}

// Add new item to menu
function addItemToMenu() {
    const name = newItemName.value.trim();
    const isPizza = itemIsPizza.checked;
    
    if (!name) {
        alert("Please enter a valid item name.");
        return;
    }
    
    if (isPizza) {
        const small = parseFloat(smallPizzaPrice.value);
        const medium = parseFloat(mediumPizzaPrice.value);
        const large = parseFloat(largePizzaPrice.value);
        
        if (isNaN(small) || isNaN(medium) || isNaN(large) || small <= 0 || medium <= 0 || large <= 0) {
            alert("Please enter valid prices for all pizza sizes.");
            return;
        }
        
        // Add three separate items for each pizza size
        const pizzaItems = [
            {
                id: `custom-${Date.now()}-small`,
                name: `${name} (Small)`,
                price: small
            },
            {
                id: `custom-${Date.now()}-medium`,
                name: `${name} (Medium)`,
                price: medium
            },
            {
                id: `custom-${Date.now()}-large`,
                name: `${name} (Large)`,
                price: large
            }
        ];
        
        customMenuItems.push(...pizzaItems);
    } else {
        const price = parseFloat(newItemPrice.value);
        if (isNaN(price) || price <= 0) {
            alert("Please enter a valid price.");
            return;
        }
        
        customMenuItems.push({
            id: `custom-${Date.now()}`,
            name,
            price
        });
    }
    
    saveCustomMenuItems();
    updateCustomMenuItemsList();
    populateMenuItems();
    
    // Clear inputs
    newItemName.value = '';
    newItemPrice.value = '';
    smallPizzaPrice.value = '';
    mediumPizzaPrice.value = '';
    largePizzaPrice.value = '';
    itemIsPizza.checked = false;
    togglePizzaPriceInputs();
}

// Update the custom menu items list in the UI
function updateCustomMenuItemsList() {
    customMenuItemsContainer.innerHTML = '';
    
    if (customMenuItems.length === 0) {
        customMenuItemsContainer.innerHTML = '<p>No custom items added yet.</p>';
        return;
    }
    
    customMenuItems.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'custom-menu-item';
        
        itemElement.innerHTML = `
            <div class="item-info">
                <span class="item-name">${item.name}</span>
                <span class="item-price">₹${item.price.toFixed(2)}</span>
            </div>
            <button class="delete-btn" data-index="${index}">×</button>
        `;
        
        const deleteBtn = itemElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteCustomMenuItem(index));
        
        customMenuItemsContainer.appendChild(itemElement);
    });
}

// Delete a custom menu item
function deleteCustomMenuItem(index) {
    if (confirm("Are you sure you want to delete this menu item?")) {
        customMenuItems.splice(index, 1);
        saveCustomMenuItems();
        updateCustomMenuItemsList();
        populateMenuItems();
    }
}

// Populate menu items container with item cards
function populateMenuItems() {
    menuItemsContainer.innerHTML = '';
    
    // Process standard menu items
    const processedMenuItems = menuItems.map(item => {
        if (item.isPizza && item.prices) {
            // Create separate items for each pizza size from menuItems.js format
            return [
                { id: `${item.id}-small`, name: `${item.name} (Small)`, price: item.prices.small },
                { id: `${item.id}-medium`, name: `${item.name} (Medium)`, price: item.prices.medium },
                { id: `${item.id}-large`, name: `${item.name} (Large)`, price: item.prices.large }
            ];
        } else {
            return [item];
        }
    }).flat();
    
    // Combine processed standard menu items with custom menu items
    const allItems = [...processedMenuItems, ...customMenuItems];
    
    // Filter items if search term exists
    const searchTerm = itemSearch.value.toLowerCase();
    const filteredItems = allItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm)
    );
    
    filteredItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-item-card';
        card.innerHTML = `
            <h3>${item.name}</h3>
            <p>₹${item.price.toFixed(2)}</p>
        `;
        
        // Add click event to handle item selection
        card.addEventListener('click', () => {
            addItemToBill(item);
        });
        
        menuItemsContainer.appendChild(card);
    });
}

// Handle item search
function handleItemSearch() {
    populateMenuItems();
}

// Add item to bill
function addItemToBill(item) {
    // Check if item already exists in bill
    const existingItemIndex = billItems.findIndex(i => 
        i.name === item.name && i.price === item.price
    );
    
    if (existingItemIndex !== -1) {
        // Increase quantity if item already exists
        billItems[existingItemIndex].quantity++;
        updateBillItemDisplay(billItems[existingItemIndex], existingItemIndex);
    } else {
        // Add new item with quantity 1
        const newItem = { ...item, quantity: 1 };
        billItems.push(newItem);
        addBillItemDisplay(newItem, billItems.length - 1);
    }
    
    // Update bill summary
    updateBillSummary();
    
    // Enable print and PDF buttons
    printBillBtn.disabled = false;
    downloadPdfBtn.disabled = false;
}

// Add new item to bill display
function addBillItemDisplay(item, index) {
    const tr = document.createElement('tr');
    tr.dataset.index = index;
    
    const itemTotal = item.price * item.quantity;
    
    tr.innerHTML = `
        <td>${item.name}</td>
        <td>₹${item.price.toFixed(2)}</td>
        <td>
            <div class="quantity-controls">
                <button class="qty-btn decrease-btn">-</button>
                <span class="item-quantity">${item.quantity}</span>
                <button class="qty-btn increase-btn">+</button>
            </div>
        </td>
        <td class="item-total">₹${itemTotal.toFixed(2)}</td>
        <td>
            <button class="delete-btn">×</button>
        </td>
    `;
    
    // Add event listeners to the buttons
    const decreaseBtn = tr.querySelector('.decrease-btn');
    const increaseBtn = tr.querySelector('.increase-btn');
    const deleteBtn = tr.querySelector('.delete-btn');
    
    decreaseBtn.addEventListener('click', () => updateItemQuantity(index, -1));
    increaseBtn.addEventListener('click', () => updateItemQuantity(index, 1));
    deleteBtn.addEventListener('click', () => removeItem(index));
    
    billItemsContainer.appendChild(tr);
}

// Update existing item display
function updateBillItemDisplay(item, index) {
    const tr = billItemsContainer.querySelector(`tr[data-index="${index}"]`);
    if (tr) {
        const quantitySpan = tr.querySelector('.item-quantity');
        const totalCell = tr.querySelector('.item-total');
        
        quantitySpan.textContent = item.quantity;
        totalCell.textContent = `₹${(item.price * item.quantity).toFixed(2)}`;
    }
}

// Update item quantity
function updateItemQuantity(index, change) {
    const item = billItems[index];
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
        removeItem(index);
    } else {
        item.quantity = newQuantity;
        updateBillItemDisplay(item, index);
        updateBillSummary();
    }
}

// Remove item from bill
function removeItem(index) {
    billItems.splice(index, 1);
    
    // Update the DOM
    billItemsContainer.innerHTML = '';
    billItems.forEach((item, idx) => {
        addBillItemDisplay(item, idx);
    });
    
    updateBillSummary();
    
    // Disable print and PDF buttons if bill is empty
    if (billItems.length === 0) {
        printBillBtn.disabled = true;
        downloadPdfBtn.disabled = true;
    }
}

// Update bill summary
function updateBillSummary() {
    // Calculate subtotal
    const subtotal = billItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    
    // Calculate service charge (10%)
    const serviceCharge = subtotal * 0.1;
    
    // Calculate discount
    const discountPercent = parseFloat(discountPercentInput.value) || 0;
    const discount = subtotal * (discountPercent / 100);
    
    // Calculate grand total
    const grandTotal = subtotal + serviceCharge - discount;
    
    // Update UI
    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    serviceChargeElement.textContent = `₹${serviceCharge.toFixed(2)}`;
    discountElement.textContent = `₹${discount.toFixed(2)}`;
    grandTotalElement.textContent = `₹${grandTotal.toFixed(2)}`;
}

// Print bill
function printBill() {
    if (billItems.length === 0) {
        alert("Please add items to the bill before printing.");
        return;
    }
    
    // Add the bill number and table number
    const billNumber = `Bill #${Math.floor(Math.random() * 10000)}`;
    const tableNumber = `Table #${Math.floor(Math.random() * 100)}`;
    
    // Store original title
    const originalTitle = document.title;
    
    // Create a temporary bill header
    const tempHeader = document.createElement('div');
    tempHeader.className = 'print-only-header';
    tempHeader.innerHTML = `
        <p style="text-align: center; font-size: 18px; margin: 5px 0; font-weight: bold;">Restaurant Bill</p>
        <p style="text-align: center; font-size: 12px; margin: 5px 0;">123 Food Street, Tasty Town</p>
        <p style="text-align: center; font-size: 12px; margin: 5px 0;">Tel: +91 98765 43210</p>
        <p style="text-align: center; font-size: 12px; margin: 5px 0;">${billNumber} | ${tableNumber}</p>
    `;
    
    // Find the bill date element
    const billDateElement = document.getElementById('bill-date');
    const originalDateContent = billDateElement.innerHTML;
    
    // Update bill date with additional info
    const now = new Date();
    billDateElement.innerHTML = `
        <p style="margin: 5px 0; text-align: center;">Date: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}</p>
    `;
    
    // Create a temporary bill footer
    const tempFooter = document.createElement('div');
    tempFooter.className = 'print-only-footer';
    tempFooter.innerHTML = `
        <p style="text-align: center; font-size: 12px; margin-top: 20px; border-top: 1px dashed #000; padding-top: 10px;">Thank you for dining with us!</p>
        <p style="text-align: center; font-size: 10px;">Visit us again soon!</p>
    `;
    
    // Temporarily append header and footer to the bill container
    const billContainer = document.querySelector('.bill-container');
    billContainer.insertBefore(tempHeader, billContainer.firstChild);
    billContainer.appendChild(tempFooter);
    
    // Make sure all print-only elements are visible
    tempHeader.style.display = 'block';
    tempFooter.style.display = 'block';
    
    // Change document title to include bill number
    document.title = billNumber;
    
    // Print the document
    setTimeout(() => {
        window.print();
        
        // Restore the original state
        document.title = originalTitle;
        billDateElement.innerHTML = originalDateContent;
        billContainer.removeChild(tempHeader);
        billContainer.removeChild(tempFooter);
    }, 100);
}

// Download bill as PDF
function downloadPdf() {
    if (billItems.length === 0) {
        alert("Please add items to the bill before downloading.");
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Generate random bill number and table number
    const billNumber = `Bill #${Math.floor(Math.random() * 10000)}`;
    const tableNumber = `Table #${Math.floor(Math.random() * 100)}`;
    
    // Add restaurant info
    doc.setFontSize(18);
    doc.text("Restaurant Bill Generator", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.text("123 Food Street, Tasty Town", 105, 28, { align: "center" });
    doc.text("Tel: +91 98765 43210", 105, 33, { align: "center" });
    
    // Add bill information
    doc.setFontSize(11);
    doc.text(`${billNumber} | ${tableNumber}`, 105, 40, { align: "center" });
    doc.text(`Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, 45, { align: "center" });
    
    // Add separator line
    doc.line(20, 50, 190, 50);
    
    // Add bill items
    doc.setFontSize(10);
    doc.text("Item", 25, 58);
    doc.text("Qty", 120, 58);
    doc.text("Price", 140, 58);
    doc.text("Total", 160, 58);
    
    // Add separator line
    doc.line(20, 60, 190, 60);
    
    let yPos = 68;
    
    billItems.forEach(item => {
        // Truncate long item names
        let displayName = item.name;
        if (displayName.length > 30) {
            displayName = displayName.substring(0, 27) + "...";
        }
        
        doc.text(displayName, 25, yPos);
        doc.text(item.quantity.toString(), 120, yPos);
        doc.text(`₹${item.price.toFixed(2)}`, 140, yPos);
        doc.text(`₹${(item.price * item.quantity).toFixed(2)}`, 160, yPos);
        yPos += 8;
    });
    
    // Add separator line
    doc.line(20, yPos, 190, yPos);
    yPos += 8;
    
    // Calculate values
    const subtotal = billItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    const serviceCharge = subtotal * 0.1;
    const discountPercent = parseFloat(discountPercentInput.value) || 0;
    const discount = subtotal * (discountPercent / 100);
    const grandTotal = subtotal + serviceCharge - discount;
    
    // Add summary
    doc.text("Subtotal:", 120, yPos);
    doc.text(`₹${subtotal.toFixed(2)}`, 160, yPos);
    yPos += 8;
    
    doc.text("Service Charge (10%):", 120, yPos);
    doc.text(`₹${serviceCharge.toFixed(2)}`, 160, yPos);
    yPos += 8;
    
    if (discount > 0) {
        doc.text(`Discount (${discountPercent}%):`, 120, yPos);
        doc.text(`₹${discount.toFixed(2)}`, 160, yPos);
        yPos += 8;
    }
    
    // Add separator line
    doc.line(120, yPos, 190, yPos);
    yPos += 8;
    
    // Add total
    doc.setFont(undefined, 'bold');
    doc.text("TOTAL:", 120, yPos);
    doc.text(`₹${grandTotal.toFixed(2)}`, 160, yPos);
    
    // Add thank you message
    doc.setFont(undefined, 'normal');
    doc.setFontSize(12);
    doc.text("Thank you for dining with us!", 105, yPos + 20, { align: "center" });
    doc.setFontSize(10);
    doc.text("Visit us again soon!", 105, yPos + 28, { align: "center" });
    
    // Save PDF with a unique name that includes the bill number
    const billNumberClean = billNumber.replace(/\s+/g, '_').replace(/#/g, '');
    doc.save(`Restaurant_Bill_${billNumberClean}.pdf`);
}

// Reset bill
function resetBill() {
    billItems = [];
    billItemsContainer.innerHTML = '';
    discountPercentInput.value = '';
    updateBillSummary();
    printBillBtn.disabled = true;
    downloadPdfBtn.disabled = true;
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init); 