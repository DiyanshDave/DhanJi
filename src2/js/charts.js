// Initialize mini expense chart
function initMiniExpenseChart() {
    const ctx = document.createElement('div');
    ctx.style.width = '100%';
    ctx.style.height = '100%';
    document.getElementById('miniExpenseChart').appendChild(ctx);
    
    miniExpenseChart = echarts.init(ctx);
    
    const option = {
      grid: { top: 5, right: 5, bottom: 5, left: 5 },
      xAxis: { show: false, type: 'category' },
      yAxis: { show: false },
      series: [{
        data: [1200, 1900, 1400, 2100, 1800, 2000, 2400],
        type: 'line',
        smooth: true,
        lineStyle: { width: 3, color: '#8b5cf6' },
        showSymbol: false,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(139, 92, 246, 0.5)' },
            { offset: 1, color: 'rgba(139, 92, 246, 0.1)' }
          ])
        }
      }]
    };
    
    miniExpenseChart.setOption(option);
    
    window.addEventListener('resize', function() {
      miniExpenseChart.resize();
    });
  }
  
  // Initialize 3D trend chart
  function initTrendChart3d() {
    trendChart3d = echarts.init(document.getElementById('trendChart3d'));
    
    // Generate sample data for the chart
    const hours = ['12am', '1am', '2am', '3am', '4am', '5am', '6am', 
                  '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', 
                  '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'];
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const data = [];
    for (let i = 0; i < days.length; i++) {
      for (let j = 0; j < hours.length; j++) {
        data.push([
          j,
          i,
          Math.round(Math.random() * 1000)
        ]);
      }
    }
    
    const option = {
      tooltip: {},
      visualMap: {
        max: 1000,
        inRange: {
          color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
        }
      },
      xAxis3D: {
        type: 'category',
        data: hours,
        name: 'Hour',
        axisLabel: { rotate: 45, interval: 3 }
      },
      yAxis3D: {
        type: 'category',
        data: days,
        name: 'Day'
      },
      zAxis3D: {
        type: 'value',
        name: 'Expense'
      },
      grid3D: {
        viewControl: {
          autoRotate: true,
          autoRotateSpeed: 10,
          distance: 120
        },
        light: {
          main: {
            intensity: 1.2,
            shadow: true,
            shadowQuality: 'high',
            alpha: 30,
            beta: 40
          },
          ambient: {
            intensity: 0.3
          }
        }
      },
      series: [{
        type: 'bar3D',
        data: data.map(item => ({
          value: [item[1], item[0], item[2]],
          itemStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#6C5B7B' },
              { offset: 0.5, color: '#C06C84' },
              { offset: 1, color: '#F67280' }
            ])
          }
        })),
        shading: 'realistic',
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: false
          },
          itemStyle: {
            color: '#F8B195'
          }
        }
      }]
    };
    
    trendChart3d.setOption(option);
    
    window.addEventListener('resize', function() {
      trendChart3d.resize();
    });
  }
  
  // Initialize 3D category chart
  function initCategoryChart3d() {
    categoryChart3d = echarts.init(document.getElementById('categoryChart3d'));
    
    const data = [
      { name: 'Food', value: 35 },
      { name: 'Transport', value: 20 },
      { name: 'Shopping', value: 15 },
      { name: 'Bills', value: 12 },
      { name: 'Entertainment', value: 10 },
      { name: 'Health', value: 5 },
      { name: 'Other', value: 3 }
    ];
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c}%'
      },
      series: [
        {
          name: 'Expense Distribution',
          type: 'pie',
          radius: ['30%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: 'rgba(23, 23, 26, 0.8)',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold',
              formatter: '{b}\n{c}%'
            }
          },
          labelLine: {
            show: false
          },
          data: data.map(item => ({
            value: item.value,
            name: item.name,
            itemStyle: {
              color: getCategoryColor(item.name.toLowerCase())
            }
          })),
          roseType: 'radius'
        }
      ]
    };
    
    categoryChart3d.setOption(option);
    
    window.addEventListener('resize', function() {
      categoryChart3d.resize();
    });
  }
  
  // Update trend chart based on time period
  function updateTrendChart(period) {
    // In a real app, you would fetch different data based on the period
    // For demo, we'll just rotate the chart differently
    const option = trendChart3d.getOption();
    
    if (period === 'weekly') {
      option.grid3D.viewControl.autoRotate = true;
      option.grid3D.viewControl.autoRotateSpeed = 10;
    } else if (period === 'monthly') {
      option.grid3D.viewControl.autoRotate = true;
      option.grid3D.viewControl.autoRotateSpeed = 5;
    } else {
      option.grid3D.viewControl.autoRotate = true;
      option.grid3D.viewControl.autoRotateSpeed = 2;
    }
    
    trendChart3d.setOption(option);
  }
  
  // Update all charts
  function updateCharts() {
    // In a real app, you would update chart data here
    // For demo, we'll just re-render them
    trendChart3d.resize();
    categoryChart3d.resize();
  }
  
  // Setup chart event listeners
  function setupChartListeners() {
    // Time period buttons
    weeklyBtn.addEventListener('click', function() {
      weeklyBtn.classList.add('bg-purple-600');
      monthlyBtn.classList.remove('bg-purple-600');
      yearlyBtn.classList.remove('bg-purple-600');
      updateTrendChart('weekly');
    });
    
    monthlyBtn.addEventListener('click', function() {
      weeklyBtn.classList.remove('bg-purple-600');
      monthlyBtn.classList.add('bg-purple-600');
      yearlyBtn.classList.remove('bg-purple-600');
      updateTrendChart('monthly');
    });
    
    yearlyBtn.addEventListener('click', function() {
      weeklyBtn.classList.remove('bg-purple-600');
      monthlyBtn.classList.remove('bg-purple-600');
      yearlyBtn.classList.add('bg-purple-600');
      updateTrendChart('yearly');
    });
  }