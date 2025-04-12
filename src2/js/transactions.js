// Render transactions list
function renderTransactions(filter = 'all') {
  transactionList.innerHTML = '';
  
  let transactionsToShow = financialData.transactions;
  
  if (filter === 'expenses') {
    transactionsToShow = financialData.transactions.filter(t => t.type === 'expense');
  } else if (filter === 'income') {
    transactionsToShow = financialData.transactions.filter(t => t.type === 'income');
  }
  
  if (transactionsToShow.length === 0) {
    transactionList.innerHTML = `
      <tr>
        <td colspan="5" class="px-4 py-8 text-center text-gray-500">
          <i class="fas fa-exchange-alt text-3xl mb-2"></i>
          <p>No transactions found</p>
        </td>
      </tr>
    `;
    return;
  }
  
  transactionsToShow.forEach(transaction => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-800/50 transition-colors';
    
    const isExpense = transaction.type === 'expense';
    const isIncome = transaction.type === 'income';
    const isSaving = transaction.type === 'saving';
    const isWithdraw = transaction.type === 'withdraw';
    
    const amountClass = isExpense ? 'text-red-400' : 
                      isIncome ? 'text-green-400' : 
                      isSaving ? 'text-blue-400' : 'text-yellow-400';
    
    const amountPrefix = isExpense ? '-' : 
                       isIncome ? '+' : 
                       isSaving ? '→' : '←';
    
    row.innerHTML = `
      <td class="px-4 py-3 whitespace-nowrap">${formatDate(transaction.date)}</td>
      <td class="px-4 py-3">${transaction.description || '-'}</td>
      <td class="px-4 py-3">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700">
          ${getCategoryIcon(transaction.category)} ${formatCategory(transaction.category)}
        </span>
      </td>
      <td class="px-4 py-3 text-right font-medium ${amountClass}">
        ${amountPrefix}₹${transaction.amount.toLocaleString('en-IN')}
      </td>
      <td class="px-4 py-3 text-right">
        <button onclick="deleteTransaction(${transaction.id})" class="text-gray-400 hover:text-red-400">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;
    
    transactionList.appendChild(row);
  });
}

// Render savings goals
function renderSavingsGoals() {
  if (financialData.savingsGoals.length === 0) {
    savingsGoalsList.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fas fa-piggy-bank text-4xl mb-2"></i>
        <p>No savings goals yet</p>
      </div>
    `;
    return;
  }
  
  savingsGoalsList.innerHTML = '';
  
  financialData.savingsGoals.forEach(goal => {
    const percentage = Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100);
    const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    const goalCard = document.createElement('div');
    goalCard.className = 'matte-card p-4';
    
    goalCard.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <h4 class="font-medium">${goal.name}</h4>
        <span class="text-sm ${daysLeft < 30 ? 'text-red-400' : 'text-gray-400'}">
          ${daysLeft > 0 ? `${daysLeft} days left` : 'Target reached'}
        </span>
      </div>
      
      <div class="mb-3">
        <div class="flex justify-between text-sm mb-1">
          <span>Saved: ₹${goal.savedAmount.toLocaleString('en-IN')}</span>
          <span>Target: ₹${goal.targetAmount.toLocaleString('en-IN')}</span>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-2">
          <div class="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full" style="width: ${percentage}%"></div>
        </div>
      </div>
      
      <div class="flex justify-between items-center">
        <span class="text-sm text-gray-400">${percentage}% completed</span>
        <div class="flex space-x-2">
          <button onclick="addToSavingsGoal(${goal.id})" class="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">
            Add
          </button>
          <button onclick="withdrawFromSavingsGoal(${goal.id})" class="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">
            Withdraw
          </button>
          <button onclick="deleteSavingsGoal(${goal.id})" class="text-xs bg-red-900/50 hover:bg-red-800/50 px-2 py-1 rounded text-red-400">
            Delete
          </button>
        </div>
      </div>
    `;
    
    savingsGoalsList.appendChild(goalCard);
  });
}

// Delete transaction
function deleteTransaction(id) {
  const transaction = financialData.transactions.find(t => t.id === id);
  if (!transaction) return;
  
  // Reverse the transaction
  if (transaction.type === 'expense') {
    financialData.balance += transaction.amount;
  } else if (transaction.type === 'income') {
    financialData.balance -= transaction.amount;
  } else if (transaction.type === 'saving') {
    financialData.balance += transaction.amount;
    financialData.savings -= transaction.amount;
  } else if (transaction.type === 'withdraw') {
    financialData.balance -= transaction.amount;
    financialData.savings += transaction.amount;
  }
  
  financialData.transactions = financialData.transactions.filter(t => t.id !== id);
  
  updateDashboard();
  renderTransactions();
  updateCharts();
  
  showNotification('success', 'Transaction Deleted', 'Transaction has been removed');
}

// Add to savings goal
function addToSavingsGoal(goalId) {
  const amount = prompt('Enter amount to add to this goal:');
  if (!amount || isNaN(parseFloat(amount))) return;
  
  const goal = financialData.savingsGoals.find(g => g.id === goalId);
  if (!goal) return;
  
  const numAmount = parseFloat(amount);
  
  if (numAmount > financialData.balance) {
    showNotification('error', 'Insufficient Funds', 'You don\'t have enough balance to save');
    return;
  }
  
  financialData.balance -= numAmount;
  goal.savedAmount += numAmount;
  
  // Add transaction
  financialData.transactions.unshift({
    id: Date.now(),
    type: 'saving',
    amount: numAmount,
    category: 'savings',
    date: new Date().toISOString().split('T')[0],
    description: `Added to ${goal.name} savings goal`
  });
  
  updateDashboard();
  renderSavingsGoals();
  renderTransactions();
  
  showNotification('success', 'Savings Updated', `₹${numAmount} added to ${goal.name}`);
}

// Withdraw from savings goal
function withdrawFromSavingsGoal(goalId) {
  const amount = prompt('Enter amount to withdraw from this goal:');
  if (!amount || isNaN(parseFloat(amount))) return;
  
  const goal = financialData.savingsGoals.find(g => g.id === goalId);
  if (!goal) return;
  
  const numAmount = parseFloat(amount);
  
  if (numAmount > goal.savedAmount) {
    showNotification('error', 'Insufficient Savings', 'You don\'t have enough savings to withdraw');
    return;
  }
  
  financialData.balance += numAmount;
  goal.savedAmount -= numAmount;
  
  // Add transaction
  financialData.transactions.unshift({
    id: Date.now(),
    type: 'withdraw',
    amount: numAmount,
    category: 'savings',
    date: new Date().toISOString().split('T')[0],
    description: `Withdrawn from ${goal.name} savings goal`
  });
  
  updateDashboard();
  renderSavingsGoals();
  renderTransactions();
  
  showNotification('success', 'Savings Updated', `₹${numAmount} withdrawn from ${goal.name}`);
}

// Delete savings goal
function deleteSavingsGoal(goalId) {
  if (!confirm('Are you sure you want to delete this savings goal? Any saved amount will be returned to your balance.')) {
    return;
  }
  
  const goal = financialData.savingsGoals.find(g => g.id === goalId);
  if (!goal) return;
  
  // Return saved amount to balance
  financialData.balance += goal.savedAmount;
  financialData.savings -= goal.savedAmount;
  
  financialData.savingsGoals = financialData.savingsGoals.filter(g => g.id !== goalId);
  
  updateDashboard();
  renderSavingsGoals();
  
  showNotification('success', 'Goal Deleted', `${goal.name} savings goal has been removed`);
}

// Setup event listeners for transactions
function setupTransactionListeners() {
  // Transaction form submission
  transactionForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    
    if (isNaN(amount)) {
      showNotification('error', 'Invalid Amount', 'Please enter a valid amount');
      return;
    }
    
    const transaction = {
      id: Date.now(),
      type,
      amount,
      category,
      date,
      description
    };
    
    // Process transaction based on type
    if (type === 'expense') {
      if (amount > financialData.balance) {
        showNotification('error', 'Insufficient Funds', 'You don\'t have enough balance for this expense');
        return;
      }
      financialData.balance -= amount;
    } else if (type === 'income') {
      financialData.balance += amount;
    } else if (type === 'saving') {
      if (amount > financialData.balance) {
        showNotification('error', 'Insufficient Funds', 'You don\'t have enough balance to save');
        return;
      }
      financialData.balance -= amount;
      financialData.savings += amount;
    } else if (type === 'withdraw') {
      if (amount > financialData.savings) {
        showNotification('error', 'Insufficient Savings', 'You don\'t have enough savings to withdraw');
        return;
      }
      financialData.savings -= amount;
      financialData.balance += amount;
    }
    
    financialData.transactions.unshift(transaction);
    
    // Reset form
    transactionForm.reset();
    document.getElementById('date').valueAsDate = new Date();
    
    // Update UI
    updateDashboard();
    renderTransactions();
    updateCharts();
    
    showNotification('success', 'Transaction Added', `${type.charAt(0).toUpperCase() + type.slice(1)} of ₹${amount} recorded`);
  });
  
  // Savings goal form submission
  savingsForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('goalName').value;
    const targetAmount = parseFloat(document.getElementById('targetAmount').value);
    const targetDate = document.getElementById('targetDate').value;
    
    if (!name || isNaN(targetAmount)) {
      showNotification('error', 'Invalid Input', 'Please fill all fields correctly');
      return;
    }
    
    const goal = {
      id: Date.now(),
      name,
      targetAmount,
      savedAmount: 0,
      targetDate,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    financialData.savingsGoals.push(goal);
    
    // Reset form
    savingsForm.reset();
    document.getElementById('targetDate').valueAsDate = new Date(new Date().setMonth(new Date().getMonth() + 3));
    
    // Update UI
    renderSavingsGoals();
    updateSavingsGoalDisplay();
    
    showNotification('success', 'Goal Created', `${name} savings goal created`);
  });
  
  // Filter transactions
  allTransactions.addEventListener('click', function() {
    allTransactions.classList.add('bg-purple-600');
    expensesOnly.classList.remove('bg-purple-600');
    incomeOnly.classList.remove('bg-purple-600');
    renderTransactions('all');
  });
  
  expensesOnly.addEventListener('click', function() {
    allTransactions.classList.remove('bg-purple-600');
    expensesOnly.classList.add('bg-purple-600');
    incomeOnly.classList.remove('bg-purple-600');
    renderTransactions('expenses');
  });
  
  incomeOnly.addEventListener('click', function() {
    allTransactions.classList.remove('bg-purple-600');
    expensesOnly.classList.remove('bg-purple-600');
    incomeOnly.classList.add('bg-purple-600');
    renderTransactions('income');
  });
}