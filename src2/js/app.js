// Sample Data Structure
let financialData = {
    balance: 50000,
    savings: 15000,
    transactions: [
      { id: 1, type: 'expense', amount: 1200, category: 'food', description: 'Dinner with friends', date: '2023-06-15' },
      { id: 2, type: 'expense', amount: 350, category: 'transport', description: 'Uber ride', date: '2023-06-14' },
      { id: 3, type: 'income', amount: 75000, category: 'salary', description: 'Monthly salary', date: '2023-06-01' },
      { id: 4, type: 'saving', amount: 5000, category: 'savings', description: 'Monthly savings', date: '2023-06-01' },
      { id: 5, type: 'expense', amount: 1800, category: 'shopping', description: 'New shoes', date: '2023-05-28' },
      { id: 6, type: 'expense', amount: 650, category: 'entertainment', description: 'Movie tickets', date: '2023-05-25' },
      { id: 7, type: 'expense', amount: 2200, category: 'bills', description: 'Electricity bill', date: '2023-05-20' },
      { id: 8, type: 'income', amount: 2500, category: 'freelance', description: 'Website project', date: '2023-05-15' }
    ],
    savingsGoals: [
      { id: 1, name: 'Europe Trip', targetAmount: 200000, savedAmount: 45000, targetDate: '2024-05-01', createdAt: '2023-01-15' },
      { id: 2, name: 'New Laptop', targetAmount: 80000, savedAmount: 25000, targetDate: '2023-09-01', createdAt: '2023-03-10' }
    ]
  };
  
  // Initialize the app when DOM is loaded
  document.addEventListener('DOMContentLoaded', init);
  
  function init() {
    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('targetDate').valueAsDate = new Date(new Date().setMonth(new Date().getMonth() + 3));
    
    // Load data
    updateDashboard();
    renderTransactions();
    renderSavingsGoals();
    
    // Initialize charts
    initMiniExpenseChart();
    initTrendChart3d();
    initCategoryChart3d();
    
    // Setup event listeners
    setupEventListeners();
    
    // Check for voice recognition support
    checkVoiceSupport();
  }
  
  // Update all dashboard metrics
  function updateDashboard() {
    // Calculate total balance
    const total = financialData.balance + financialData.savings;
    totalBalance.textContent = `₹${total.toLocaleString('en-IN')}`;
    availableBalance.textContent = `₹${financialData.balance.toLocaleString('en-IN')}`;
    savingsBalance.textContent = `₹${financialData.savings.toLocaleString('en-IN')}`;
    
    // Calculate monthly expenses
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyExpensesData = financialData.transactions
      .filter(t => t.type === 'expense' && 
        new Date(t.date).getMonth() === currentMonth && 
        new Date(t.date).getFullYear() === currentYear);
    
    const monthlyTotal = monthlyExpensesData.reduce((sum, t) => sum + t.amount, 0);
    monthlyExpenses.textContent = `₹${monthlyTotal.toLocaleString('en-IN')}`;
    
    // Calculate change from last month
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthExpenses = financialData.transactions
      .filter(t => t.type === 'expense' && 
        new Date(t.date).getMonth() === lastMonth && 
        new Date(t.date).getFullYear() === lastMonthYear)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const change = lastMonthExpenses > 0 ? 
      ((monthlyTotal - lastMonthExpenses) / lastMonthExpenses * 100).toFixed(1) : 0;
    
    if (change > 0) {
      expenseChange.innerHTML = `<span class="text-red-400">+${change}%</span> <span class="text-gray-500 ml-1">from last month</span>`;
    } else {
      expenseChange.innerHTML = `<span class="text-green-400">${change}%</span> <span class="text-gray-500 ml-1">from last month</span>`;
    }
    
    // Update transaction count
    transactionCount.textContent = `Showing ${financialData.transactions.length} transactions`;
    
    // Update savings goal
    updateSavingsGoalDisplay();
  }
  
  // Update savings goal display
  function updateSavingsGoalDisplay() {
    if (financialData.savingsGoals.length > 0) {
      const totalTarget = financialData.savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
      const totalSaved = financialData.savingsGoals.reduce((sum, goal) => sum + goal.savedAmount, 0);
      const percentage = Math.min(Math.round((totalSaved / totalTarget) * 100), 100);
      
      savingsGoal.textContent = `₹${totalSaved.toLocaleString('en-IN')}`;
      savingsPercentage.textContent = `${percentage}% completed`;
      savingsProgressBar.style.width = `${percentage}%`;
      savingsTarget.textContent = `₹${totalTarget.toLocaleString('en-IN')}`;
    } else {
      savingsGoal.textContent = '₹0';
      savingsPercentage.textContent = '0% completed';
      savingsProgressBar.style.width = '0%';
      savingsTarget.textContent = '₹0';
    }
  }
  
  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
  
  // Format category
  function formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }
  
  // Get category icon
  function getCategoryIcon(category) {
    const icons = {
      food: '🍔',
      transport: '🚗',
      shopping: '🛍️',
      bills: '💡',
      entertainment: '🎬',
      health: '🏥',
      education: '📚',
      salary: '💰',
      freelance: '💼',
      savings: '💰',
      other: '💼'
    };
    return icons[category] || '💼';
  }
  
  // Get category color
  function getCategoryColor(category) {
    const colors = {
      food: '#FF6B6B',
      transport: '#4ECDC4',
      shopping: '#FFBE76',
      bills: '#778BEB',
      entertainment: '#CF6A87',
      health: '#6C5B7B',
      education: '#F8A5C2',
      salary: '#3DC1D3',
      freelance: '#F5CD79',
      savings: '#786FA6',
      other: '#546DE5'
    };
    return colors[category] || '#546DE5';
  }
  
  // Show notification
  function showNotification(type, title, message) {
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    if (type === 'success') {
      toastIcon.className = 'w-8 h-8 rounded-full flex items-center justify-center bg-green-500';
      toastIcon.innerHTML = '<i class="fas fa-check text-white"></i>';
    } else if (type === 'error') {
      toastIcon.className = 'w-8 h-8 rounded-full flex items-center justify-center bg-red-500';
      toastIcon.innerHTML = '<i class="fas fa-times text-white"></i>';
    } else {
      toastIcon.className = 'w-8 h-8 rounded-full flex items-center justify-center bg-blue-500';
      toastIcon.innerHTML = '<i class="fas fa-info-circle text-white"></i>';
    }
    
    notificationToast.classList.remove('translate-x-96');
    
    setTimeout(() => {
      notificationToast.classList.add('translate-x-96');
    }, 3000);
  }
  
  // Toggle theme
  function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    updateThemeIcon();
  }
  
  // Update theme icon
  function updateThemeIcon() {
    if (document.documentElement.classList.contains('dark')) {
      themeIcon.classList.remove('fa-moon');
      themeIco// Sample Data Structure
let financialData = {
  balance: 50000,
  savings: 15000,
  transactions: [
    { id: 1, type: 'expense', amount: 1200, category: 'food', description: 'Dinner with friends', date: '2023-06-15' },
    { id: 2, type: 'expense', amount: 350, category: 'transport', description: 'Uber ride', date: '2023-06-14' },
    { id: 3, type: 'income', amount: 75000, category: 'salary', description: 'Monthly salary', date: '2023-06-01' },
    { id: 4, type: 'saving', amount: 5000, category: 'savings', description: 'Monthly savings', date: '2023-06-01' },
    { id: 5, type: 'expense', amount: 1800, category: 'shopping', description: 'New shoes', date: '2023-05-28' },
    { id: 6, type: 'expense', amount: 650, category: 'entertainment', description: 'Movie tickets', date: '2023-05-25' },
    { id: 7, type: 'expense', amount: 2200, category: 'bills', description: 'Electricity bill', date: '2023-05-20' },
    { id: 8, type: 'income', amount: 2500, category: 'freelance', description: 'Website project', date: '2023-05-15' }
  ],
  savingsGoals: [
    { id: 1, name: 'Europe Trip', targetAmount: 200000, savedAmount: 45000, targetDate: '2024-05-01', createdAt: '2023-01-15' },
    { id: 2, name: 'New Laptop', targetAmount: 80000, savedAmount: 25000, targetDate: '2023-09-01', createdAt: '2023-03-10' }
  ]
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

function init() {
  // Set today's date as default
  document.getElementById('date').valueAsDate = new Date();
  document.getElementById('targetDate').valueAsDate = new Date(new Date().setMonth(new Date().getMonth() + 3));
  
  // Load data
  updateDashboard();
  renderTransactions();
  renderSavingsGoals();
  
  // Initialize charts
  initMiniExpenseChart();
  initTrendChart3d();
  initCategoryChart3d();
  
  // Setup event listeners
  setupEventListeners();
  
  // Check for voice recognition support
  checkVoiceSupport();
}

// Update all dashboard metrics
function updateDashboard() {
  // Calculate total balance
  const total = financialData.balance + financialData.savings;
  totalBalance.textContent = `₹${total.toLocaleString('en-IN')}`;
  availableBalance.textContent = `₹${financialData.balance.toLocaleString('en-IN')}`;
  savingsBalance.textContent = `₹${financialData.savings.toLocaleString('en-IN')}`;
  
  // Calculate monthly expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpensesData = financialData.transactions
    .filter(t => t.type === 'expense' && 
      new Date(t.date).getMonth() === currentMonth && 
      new Date(t.date).getFullYear() === currentYear);
  
  const monthlyTotal = monthlyExpensesData.reduce((sum, t) => sum + t.amount, 0);
  monthlyExpenses.textContent = `₹${monthlyTotal.toLocaleString('en-IN')}`;
  
  // Calculate change from last month
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastMonthExpenses = financialData.transactions
    .filter(t => t.type === 'expense' && 
      new Date(t.date).getMonth() === lastMonth && 
      new Date(t.date).getFullYear() === lastMonthYear)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const change = lastMonthExpenses > 0 ? 
    ((monthlyTotal - lastMonthExpenses) / lastMonthExpenses * 100).toFixed(1) : 0;
  
  if (change > 0) {
    expenseChange.innerHTML = `<span class="text-red-400">+${change}%</span> <span class="text-gray-500 ml-1">from last month</span>`;
  } else {
    expenseChange.innerHTML = `<span class="text-green-400">${change}%</span> <span class="text-gray-500 ml-1">from last month</span>`;
  }
  
  // Update transaction count
  transactionCount.textContent = `Showing ${financialData.transactions.length} transactions`;
  
  // Update savings goal
  updateSavingsGoalDisplay();
}

// Update savings goal display
function updateSavingsGoalDisplay() {
  if (financialData.savingsGoals.length > 0) {
    const totalTarget = financialData.savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalSaved = financialData.savingsGoals.reduce((sum, goal) => sum + goal.savedAmount, 0);
    const percentage = Math.min(Math.round((totalSaved / totalTarget) * 100), 100);
    
    savingsGoal.textContent = `₹${totalSaved.toLocaleString('en-IN')}`;
    savingsPercentage.textContent = `${percentage}% completed`;
    savingsProgressBar.style.width = `${percentage}%`;
    savingsTarget.textContent = `₹${totalTarget.toLocaleString('en-IN')}`;
  } else {
    savingsGoal.textContent = '₹0';
    savingsPercentage.textContent = '0% completed';
    savingsProgressBar.style.width = '0%';
    savingsTarget.textContent = '₹0';
  }
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// Format category
function formatCategory(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

// Get category icon
function getCategoryIcon(category) {
  const icons = {
    food: '🍔',
    transport: '🚗',
    shopping: '🛍️',
    bills: '💡',
    entertainment: '🎬',
    health: '🏥',
    education: '📚',
    salary: '💰',
    freelance: '💼',
    savings: '💰',
    other: '💼'
  };
  return icons[category] || '💼';
}

// Get category color
function getCategoryColor(category) {
  const colors = {
    food: '#FF6B6B',
    transport: '#4ECDC4',
    shopping: '#FFBE76',
    bills: '#778BEB',
    entertainment: '#CF6A87',
    health: '#6C5B7B',
    education: '#F8A5C2',
    salary: '#3DC1D3',
    freelance: '#F5CD79',
    savings: '#786FA6',
    other: '#546DE5'
  };
  return colors[category] || '#546DE5';
}

// Show notification
function showNotification(type, title, message) {
  toastTitle.textContent = title;
  toastMessage.textContent = message;
  
  if (type === 'success') {
    toastIcon.className = 'w-8 h-8 rounded-full flex items-center justify-center bg-green-500';
    toastIcon.innerHTML = '<i class="fas fa-check text-white"></i>';
  } else if (type === 'error') {
    toastIcon.className = 'w-8 h-8 rounded-full flex items-center justify-center bg-red-500';
    toastIcon.innerHTML = '<i class="fas fa-times text-white"></i>';
  } else {
    toastIcon.className = 'w-8 h-8 rounded-full flex items-center justify-center bg-blue-500';
    toastIcon.innerHTML = '<i class="fas fa-info-circle text-white"></i>';
  }
  
  notificationToast.classList.remove('translate-x-96');
  
  setTimeout(() => {
    notificationToast.classList.add('translate-x-96');
  }, 3000);
}

// Toggle theme
function toggleTheme() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  updateThemeIcon();
}

// Update theme icon
function updateThemeIcon() {
  if (document.documentElement.classList.contains('dark')) {
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
    themeIcon.classList.remove('text-yellow-300');
    themeIcon.classList.add('text-yellow-400');
  } else {
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
    themeIcon.classList.remove('text-yellow-400');
    themeIcon.classList.add('text-yellow-300');
  }
}

// Make functions available globally
window.deleteTransaction = deleteTransaction;
window.addToSavingsGoal = addToSavingsGoal;
window.withdrawFromSavingsGoal = withdrawFromSavingsGoal;
window.deleteSavingsGoal = deleteSavingsGoal;n.classList.add('fa-sun');
      themeIcon.classList.remove('text-yellow-300');
      themeIcon.classList.add('text-yellow-400');
    } else {
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
      themeIcon.classList.remove('text-yellow-400');
      themeIcon.classList.add('text-yellow-300');
    }
  }
  
  // Make functions available globally
  window.deleteTransaction = deleteTransaction;
  window.addToSavingsGoal = addToSavingsGoal;
  window.withdrawFromSavingsGoal = withdrawFromSavingsGoal;
  window.deleteSavingsGoal = deleteSavingsGoal;
  // Setup event listeners
function setupEventListeners() {
  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);
  
  // Setup transaction listeners
  setupTransactionListeners();
  
  // Setup chart listeners
  setupChartListeners();
  
  // Setup voice listeners
  setupVoiceListeners();
  
  // Check for voice recognition support
  checkVoiceSupport();
}