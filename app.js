// India Demographics Portal - Application Logic

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const yearSlider = document.getElementById('year-slider');
  const yearDisplay = document.getElementById('year-display');
  const yearTicksContainer = document.getElementById('year-ticks-container');
  const stateSearch = document.getElementById('state-search');
  
  // Summary Metrics
  const valTotalPop = document.getElementById('val-total-pop');
  const pctGrowthPop = document.getElementById('pct-growth-pop');
  const valMalePop = document.getElementById('val-male-pop');
  const pctMaleShare = document.getElementById('pct-male-share');
  const valFemalePop = document.getElementById('val-female-pop');
  const pctFemaleShare = document.getElementById('pct-female-share');
  const valSexRatio = document.getElementById('val-sex-ratio');
  
  // Toggles & Filters
  const btnFilterAll = document.getElementById('filter-all');
  const btnFilterStates = document.getElementById('filter-states');
  const btnFilterUTs = document.getElementById('filter-uts');
  const btnToggleNumberFormat = document.getElementById('toggle-number-format');
  const formatLabel = document.getElementById('format-label');
  
  // Containers
  const religionContainer = document.getElementById('religion-container');
  const literacyContainer = document.getElementById('literacy-container');
  const socialGridContainer = document.getElementById('social-grid-container');
  
  // Table
  const tableBody = document.getElementById('table-body');
  const tableSubtitle = document.getElementById('table-subtitle');
  const tableEmpty = document.getElementById('table-empty');
  
  // Sort Headers
  const headers = {
    rank: document.getElementById('sort-rank'),
    state: document.getElementById('sort-state'),
    total: document.getElementById('sort-total'),
    male: document.getElementById('sort-male'),
    female: document.getElementById('sort-female'),
    ratio: document.getElementById('sort-ratio')
  };

  // --- State Variables ---
  let currentYear = 2021;
  let searchFilter = '';
  let regionFilter = 'all'; // 'all', 'states', 'uts'
  let numberFormatMode = 'in'; // 'in' (Lakhs/Crores), 'en' (Millions)
  let selectedRegion = 'India'; // 'India' (National) or specific State/UT name
  
  let currentSortCol = 'total'; // default sorting col
  let currentSortOrder = 'desc'; // 'asc' or 'desc'

  // --- Helper Functions ---

  // Standard Indian Number Formatter (e.g. 12,34,56,789)
  function formatIndianNumber(num) {
    let numStr = Math.round(num).toString();
    let lastThree = numStr.substring(numStr.length - 3);
    let otherNumbers = numStr.substring(0, numStr.length - 3);
    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  }

  // Standard International Number Formatter (e.g. 123,456,789)
  function formatInternationalNumber(num) {
    return Math.round(num).toLocaleString('en-US');
  }

  // Full Number Formatter based on active mode
  function formatFullNumber(num) {
    return numberFormatMode === 'in' ? formatIndianNumber(num) : formatInternationalNumber(num);
  }

  // Abbreviated Suffix Formatter (e.g. 136.30 Cr or 1,363.01 M)
  function formatAbbreviated(num) {
    if (numberFormatMode === 'in') {
      if (num >= 10000000) { // 1 Crore (10 Million)
        return (num / 10000000).toFixed(2) + ' Cr';
      } else if (num >= 100000) { // 1 Lakh (100k)
        return (num / 100000).toFixed(2) + ' L';
      }
      return formatIndianNumber(num);
    } else {
      if (num >= 1000000) { // 1 Million
        return (num / 1000000).toFixed(2) + ' M';
      }
      return formatInternationalNumber(num);
    }
  }

  // Determine if a region name is a Union Territory
  function isUnionTerritory(name) {
    const norm = name.toLowerCase().replace(/[\s&]/g, '');
    return window.UNION_TERRITORIES.some(ut => ut.toLowerCase().replace(/[\s&]/g, '') === norm);
  }

  // --- Year ticks initialization ---
  function initYearTicks() {
    yearTicksContainer.innerHTML = '';
    for (let y = 2011; y <= 2026; y++) {
      const span = document.createElement('span');
      span.textContent = y;
      if (y === currentYear) span.classList.add('active');
      span.addEventListener('click', () => {
        yearSlider.value = y;
        updateYear(y);
      });
      yearTicksContainer.appendChild(span);
    }
  }

  function updateYearTicksHighlight() {
    const ticks = yearTicksContainer.querySelectorAll('span');
    ticks.forEach(tick => {
      if (parseInt(tick.textContent) === currentYear) {
        tick.classList.add('active');
      } else {
        tick.classList.remove('active');
      }
    });
  }

  // --- Render Functions ---

  // 1. Render National Cards
  function renderNationalCards() {
    const regionData = window.DEMOGRAPHICS_DATA[selectedRegion];
    if (!regionData) return;

    const total = regionData['Person'][currentYear];
    const male = regionData['Male'][currentYear];
    const female = regionData['Female'][currentYear];
    
    // Growth Pop since 2011
    const total2011 = regionData['Person'][2011];
    const growthPercent = (((total - total2011) / total2011) * 100).toFixed(2);
    
    // Male/Female splits
    const malePct = ((male / total) * 100).toFixed(1);
    const femalePct = ((female / total) * 100).toFixed(1);
    
    // Sex ratio
    const sexRatio = Math.round((female / male) * 1000);

    // Apply values to UI
    valTotalPop.textContent = formatAbbreviated(total);
    valTotalPop.title = formatFullNumber(total);
    pctGrowthPop.textContent = `+${growthPercent}% growth since 2011`;
    
    valMalePop.textContent = formatAbbreviated(male);
    valMalePop.title = formatFullNumber(male);
    pctMaleShare.textContent = `${malePct}% of total population`;
    
    valFemalePop.textContent = formatAbbreviated(female);
    valFemalePop.title = formatFullNumber(female);
    pctFemaleShare.textContent = `${femalePct}% of total population`;
    
    valSexRatio.textContent = sexRatio;

    // Update labels dynamically
    const regionName = selectedRegion === 'India' ? 'India' : selectedRegion;
    document.querySelector('#metric-pop .metric-label').textContent = `${regionName} Population`;
    document.querySelector('#metric-male .metric-label').textContent = `${regionName} Male Pop`;
    document.querySelector('#metric-female .metric-label').textContent = `${regionName} Female Pop`;
    document.querySelector('#metric-ratio .metric-label').textContent = `${regionName} Sex Ratio`;

    // Update national badges
    const badges = document.querySelectorAll('.badge-national');
    badges.forEach(badge => {
      if (selectedRegion === 'India') {
        badge.textContent = 'National Level';
        badge.style.background = 'var(--primary-light)';
        badge.style.borderColor = 'rgba(99, 102, 241, 0.4)';
        badge.style.color = '#818cf8';
      } else {
        badge.textContent = 'National Context';
        badge.style.background = 'var(--warning-light)';
        badge.style.borderColor = 'rgba(245, 158, 11, 0.4)';
        badge.style.color = '#fbbf24';
      }
    });
  }

  // 2. Render Religion Progress Bars
  function renderReligionSection() {
    religionContainer.innerHTML = '';
    
    window.RELIGION_DATA.forEach(item => {
      const row = document.createElement('div');
      row.className = 'religion-row';
      
      row.innerHTML = `
        <div style="width: 100%;">
          <div class="religion-name-container">
            <span class="color-dot" style="background-color: ${item.color};"></span>
            <strong style="color: var(--text-primary);">${item.religion}</strong>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="background-color: ${item.color}; width: ${item.census2011}%;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
            <span>Census 2011: <span class="religion-percent">${item.census2011}%</span></span>
            <span>Pew Est. (2020): <span class="religion-percent">${item.projection2020}%</span></span>
          </div>
        </div>
      `;
      religionContainer.appendChild(row);
    });
  }

  // 3. Render Literacy Rate Section
  function renderLiteracySection() {
    literacyContainer.innerHTML = '';
    const lit11 = window.LITERACY_DATA['Census 2011'];
    const lit24 = window.LITERACY_DATA['PLFS 2023-24'];

    const categories = [
      { key: 'overall', label: 'Overall Literacy' },
      { key: 'male', label: 'Male Literacy' },
      { key: 'female', label: 'Female Literacy' }
    ];

    categories.forEach(cat => {
      const valOld = lit11[cat.key];
      const valNew = lit24[cat.key];
      const diff = (valNew - valOld).toFixed(1);

      const box = document.createElement('div');
      box.className = 'literacy-metric-box';
      box.innerHTML = `
        <div class="lit-header">${cat.label}</div>
        <div class="lit-value-comp">
          <span class="lit-val-old" title="Census 2011">${valOld}%</span>
          <span class="lit-val-new" title="PLFS 2023-24">${valNew}%</span>
        </div>
        <div class="lit-trend-indicator">▲ +${diff}% improvement</div>
      `;
      literacyContainer.appendChild(box);
    });
  }

  // 4. Render Social Categories (SC/ST)
  function renderSocialCategories() {
    socialGridContainer.innerHTML = '';
    const regionData = window.DEMOGRAPHICS_DATA[selectedRegion];
    if (!regionData) return;

    const total = regionData['Person'][currentYear];
    const regionName = selectedRegion === 'India' ? 'India' : selectedRegion;
    document.querySelector('#social-categories-summary .chart-title').textContent = `Social Demographics & Categories (${regionName})`;

    Object.entries(window.SOCIAL_CATEGORIES).forEach(([key, category]) => {
      const rawCount = Math.round((category.percentage / 100) * total);
      
      const item = document.createElement('div');
      item.className = 'social-item';
      item.innerHTML = `
        <div class="social-title">${key}</div>
        <div class="social-pct">${category.percentage}%</div>
        <div class="social-abs" title="Estimated absolute count based on ${currentYear} population in ${regionName}">${formatFullNumber(rawCount)} est.</div>
        <div class="social-desc">${category.note}</div>
      `;
      socialGridContainer.appendChild(item);
    });
  }

  // 5. Render Demographics Table (Searchable & Sortable)
  function renderTable() {
    tableSubtitle.textContent = `Displaying population data for ${currentYear} (click columns to sort)`;
    
    // Compile table rows from dataset
    let rowsData = [];
    
    Object.entries(window.DEMOGRAPHICS_DATA).forEach(([state, data]) => {
      if (state === 'India') return; // Exclude national sum
      
      const isUT = isUnionTerritory(state);
      
      // Filter states vs UTs
      if (regionFilter === 'states' && isUT) return;
      if (regionFilter === 'uts' && !isUT) return;
      
      // Search term filter
      if (searchFilter && !state.toLowerCase().includes(searchFilter)) return;
      
      const total = data['Person'][currentYear];
      const male = data['Male'][currentYear];
      const female = data['Female'][currentYear];
      const sexRatio = male > 0 ? Math.round((female / male) * 1000) : 0;
      
      rowsData.push({
        state,
        total,
        male,
        female,
        sexRatio,
        isUT
      });
    });

    // Handle Sorting
    rowsData.sort((a, b) => {
      let valA, valB;
      
      if (currentSortCol === 'state') {
        valA = a.state.toLowerCase();
        valB = b.state.toLowerCase();
      } else if (currentSortCol === 'total') {
        valA = a.total;
        valB = b.total;
      } else if (currentSortCol === 'male') {
        valA = a.male;
        valB = b.male;
      } else if (currentSortCol === 'female') {
        valA = a.female;
        valB = b.female;
      } else if (currentSortCol === 'ratio') {
        valA = a.sexRatio;
        valB = b.sexRatio;
      } else { // default or rank
        // To sort by rank, we sort by absolute population descending
        valA = a.total;
        valB = b.total;
      }

      if (currentSortCol === 'state') {
        if (currentSortOrder === 'asc') return valA.localeCompare(valB);
        return valB.localeCompare(valA);
      } else {
        // Number columns
        // For rank, it's inverse: population desc = rank asc
        if (currentSortCol === 'rank') {
          if (currentSortOrder === 'asc') return valB - valA; // highest pop first
          return valA - valB; // lowest pop first
        }
        
        if (currentSortOrder === 'asc') return valA - valB;
        return valB - valA;
      }
    });

    // Render Rows
    tableBody.innerHTML = '';
    
    if (rowsData.length === 0) {
      tableEmpty.style.display = 'block';
      return;
    } else {
      tableEmpty.style.display = 'none';
    }

    // We calculate standard rank indices based on overall populations (not filtered ranks)
    // To do this, let's create a lookup map of overall population rankings for this year.
    let rankLookup = {};
    Object.entries(window.DEMOGRAPHICS_DATA)
      .filter(([s]) => s !== 'India')
      .map(([s, d]) => ({ state: s, total: d['Person'][currentYear] }))
      .sort((a, b) => b.total - a.total)
      .forEach((item, index) => {
        rankLookup[item.state] = index + 1;
      });

    rowsData.forEach(row => {
      const tr = document.createElement('tr');
      const rank = rankLookup[row.state] || '--';
      
      // Mark sex ratio color based on national projections
      // 943 was census 2011. Anything higher than 950 is good, under 900 is critical.
      let ratioClass = 'col-ratio';
      if (row.sexRatio >= 960) ratioClass += ' good';
      else if (row.sexRatio < 910) ratioClass += ' bad';

      if (row.state === selectedRegion) {
        tr.classList.add('selected-row');
      }

      tr.addEventListener('click', () => {
        selectRegion(row.state);
      });

      tr.innerHTML = `
        <td class="col-rank">${rank}</td>
        <td class="col-state">${row.state}${row.isUT ? ' <span style="font-size:0.7rem; color:var(--primary); background:rgba(99,102,241,0.1); padding:1px 5px; border-radius:4px; margin-left:4px;">UT</span>' : ''}</td>
        <td class="col-num">${formatFullNumber(row.total)}</td>
        <td class="col-num">${formatFullNumber(row.male)}</td>
        <td class="col-num">${formatFullNumber(row.female)}</td>
        <td class="${ratioClass}">${row.sexRatio}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // Setup Sort Header Classes & Clicks
  function setupSortHeaders() {
    Object.entries(headers).forEach(([colKey, element]) => {
      element.addEventListener('click', () => {
        if (currentSortCol === colKey) {
          // Toggle order
          currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          currentSortCol = colKey;
          currentSortOrder = 'desc'; // default to high-to-low on change
        }
        
        // Update header classes
        Object.entries(headers).forEach(([k, el]) => {
          const icon = el.querySelector('.sort-icon');
          if (k === currentSortCol) {
            icon.textContent = currentSortOrder === 'asc' ? '▲' : '▼';
          } else {
            icon.textContent = '';
          }
        });
        
        renderTable();
      });
    });
  }

  // 6. Draw Premium Interactive SVG Line Charts
  function drawSVGCharts() {
    drawPopulationChart();
    drawSexRatioChart();
  }

  function drawPopulationChart() {
    const container = document.getElementById('pop-trend-chart-container');
    container.innerHTML = '';
    
    const regionData = window.DEMOGRAPHICS_DATA[selectedRegion];
    if (!regionData) return;

    // Update dynamic title
    const titleEl = document.querySelector('#chart-population-trend .chart-title');
    if (titleEl) {
      titleEl.textContent = `${selectedRegion} Population Growth Trend (2011 – 2026)`;
    }
    
    const width = container.clientWidth || 550;
    const height = 300;
    const paddingLeft = 65;
    const paddingRight = 20;
    const paddingTop = 30;
    const paddingBottom = 40;
    
    const yearsArr = Array.from({ length: 16 }, (_, i) => 2011 + i);
    const dataPoints = yearsArr.map(y => ({
      year: y,
      value: regionData['Person'][y]
    }));
    
    // Dynamic scale bounds calculation
    const values = dataPoints.map(pt => pt.value);
    const minVal = Math.min(...values) * 0.98;
    const maxVal = Math.max(...values) * 1.02;
    
    // Scale functions
    const xScale = y => paddingLeft + ((y - 2011) / 15) * (width - paddingLeft - paddingRight);
    const yScale = val => height - paddingBottom - ((val - minVal) / (maxVal - minVal)) * (height - paddingTop - paddingBottom);
    
    // Generate Path points
    let pathD = '';
    let areaPoints = `${paddingLeft},${height - paddingBottom} `;
    
    dataPoints.forEach((pt, idx) => {
      const x = xScale(pt.year);
      const y = yScale(pt.value);
      if (idx === 0) {
        pathD += `M ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
      }
      areaPoints += `${x},${y} `;
    });
    areaPoints += `${xScale(2026)},${height - paddingBottom}`;

    // Create Tooltip DOM inside container if not present
    let tooltip = container.querySelector('.chart-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'chart-tooltip';
      container.appendChild(tooltip);
    }

    // Build SVG
    let svgContent = `
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        
        <!-- Grid lines & Y Axis labels -->
        ${[0, 0.25, 0.5, 0.75, 1].map(fraction => {
          const rawNum = minVal + fraction * (maxVal - minVal);
          const y = yScale(rawNum);
          const formattedLabel = formatAbbreviated(rawNum);
          return `
            <line class="chart-grid-line" x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}"/>
            <text class="chart-axis-text" x="${paddingLeft - 8}" y="${y + 4}" text-anchor="end">${formattedLabel}</text>
          `;
        }).join('')}
        
        <!-- X Axis labels -->
        ${[2011, 2014, 2017, 2020, 2023, 2026].map(y => `
          <text class="chart-axis-text" x="${xScale(y)}" y="${height - 15}" text-anchor="middle">${y}</text>
        `).join('')}
        
        <!-- Selected Year Highlight Line Overlay -->
        <line id="pop-year-line" x1="${xScale(currentYear)}" y1="${paddingTop}" x2="${xScale(currentYear)}" y2="${height - paddingBottom}" stroke="rgba(99, 102, 241, 0.4)" stroke-width="2" stroke-dasharray="4,4" />

        <!-- Area Fill -->
        <polygon class="chart-line-bg" points="${areaPoints}" />
        
        <!-- Line Path -->
        <path class="chart-line" d="${pathD}" />
        
        <!-- Interactive Circle Points -->
        ${dataPoints.map(pt => {
          const x = xScale(pt.year);
          const y = yScale(pt.value);
          const isSelected = pt.year === currentYear;
          const r = isSelected ? 6 : 4;
          const fill = isSelected ? '#ffffff' : 'var(--primary)';
          const stroke = isSelected ? 'var(--primary)' : '#ffffff';
          const strokeWidth = isSelected ? 3 : 2;
          
          return `
            <circle class="chart-point" cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"
              data-year="${pt.year}" data-value="${pt.value}" />
          `;
        }).join('')}
      </svg>
    `;
    
    // Render SVG
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    container.appendChild(doc.documentElement);
    
    // Add Mouse Interactive Listeners on Points
    const points = container.querySelectorAll('.chart-point');
    points.forEach(pt => {
      pt.addEventListener('mouseover', (e) => {
        const year = e.target.getAttribute('data-year');
        const val = parseFloat(e.target.getAttribute('data-value'));
        
        tooltip.innerHTML = `
          <strong>Year ${year}</strong><br>
          Pop: ${formatFullNumber(val)}<br>
          <em>(${formatAbbreviated(val)})</em>
        `;
        
        const rect = container.getBoundingClientRect();
        const ptX = e.clientX - rect.left;
        const ptY = e.clientY - rect.top;
        
        tooltip.style.left = `${ptX + 15}px`;
        tooltip.style.top = `${ptY - 45}px`;
        tooltip.style.opacity = '1';
      });
      
      pt.addEventListener('mouseout', () => {
        tooltip.style.opacity = '0';
      });
      
      pt.addEventListener('click', (e) => {
        const year = parseInt(e.target.getAttribute('data-year'));
        yearSlider.value = year;
        updateYear(year);
      });
    });
  }

  function drawSexRatioChart() {
    const container = document.getElementById('ratio-trend-chart-container');
    container.innerHTML = '';
    
    const regionData = window.DEMOGRAPHICS_DATA[selectedRegion];
    if (!regionData) return;

    // Update dynamic title
    const titleEl = document.querySelector('#chart-ratio-trend .chart-title');
    if (titleEl) {
      titleEl.textContent = `${selectedRegion} Sex Ratio Trajectory (2011 – 2026)`;
    }
    
    const width = container.clientWidth || 550;
    const height = 300;
    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 30;
    const paddingBottom = 40;
    
    const yearsArr = Array.from({ length: 16 }, (_, i) => 2011 + i);
    const dataPoints = yearsArr.map(y => {
      const male = regionData['Male'][y];
      const female = regionData['Female'][y];
      return {
        year: y,
        value: Math.round((female / male) * 1000)
      };
    });
    
    // Dynamic scale bounds calculation
    const values = dataPoints.map(pt => pt.value);
    const minVal = Math.min(...values) - 5;
    const maxVal = Math.max(...values) + 5;
    
    // Scale functions
    const xScale = y => paddingLeft + ((y - 2011) / 15) * (width - paddingLeft - paddingRight);
    const yScale = val => height - paddingBottom - ((val - minVal) / (maxVal - minVal)) * (height - paddingTop - paddingBottom);
    
    // Generate Path points
    let pathD = '';
    let areaPoints = `${paddingLeft},${height - paddingBottom} `;
    
    dataPoints.forEach((pt, idx) => {
      const x = xScale(pt.year);
      const y = yScale(pt.value);
      if (idx === 0) {
        pathD += `M ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
      }
      areaPoints += `${x},${y} `;
    });
    areaPoints += `${xScale(2026)},${height - paddingBottom}`;

    // Create Tooltip DOM inside container if not present
    let tooltip = container.querySelector('.chart-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'chart-tooltip';
      container.appendChild(tooltip);
    }

    // Build SVG
    let svgContent = `
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ratio-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--success)" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="var(--success)" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        
        <!-- Grid lines & Y Axis labels -->
        ${[0, 0.25, 0.5, 0.75, 1].map(fraction => {
          const rawNum = Math.round(minVal + fraction * (maxVal - minVal));
          const y = yScale(rawNum);
          return `
            <line class="chart-grid-line" x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}"/>
            <text class="chart-axis-text" x="${paddingLeft - 8}" y="${y + 4}" text-anchor="end">${rawNum}</text>
          `;
        }).join('')}
        
        <!-- X Axis labels -->
        ${[2011, 2014, 2017, 2020, 2023, 2026].map(y => `
          <text class="chart-axis-text" x="${xScale(y)}" y="${height - 15}" text-anchor="middle">${y}</text>
        `).join('')}
        
        <!-- Selected Year Highlight Line Overlay -->
        <line id="ratio-year-line" x1="${xScale(currentYear)}" y1="${paddingTop}" x2="${xScale(currentYear)}" y2="${height - paddingBottom}" stroke="rgba(16, 185, 129, 0.4)" stroke-width="2" stroke-dasharray="4,4" />

        <!-- Area Fill -->
        <polygon class="chart-line-bg" points="${areaPoints}" style="fill: url(#ratio-gradient);" />
        
        <!-- Line Path -->
        <path class="chart-line" d="${pathD}" style="stroke: var(--success);" />
        
        <!-- Interactive Circle Points -->
        ${dataPoints.map(pt => {
          const x = xScale(pt.year);
          const y = yScale(pt.value);
          const isSelected = pt.year === currentYear;
          const r = isSelected ? 6 : 4;
          const fill = isSelected ? '#ffffff' : 'var(--success)';
          const stroke = isSelected ? 'var(--success)' : '#ffffff';
          const strokeWidth = isSelected ? 3 : 2;
          
          return `
            <circle class="chart-point" cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"
              data-year="${pt.year}" data-value="${pt.value}" style="fill: ${fill}; stroke: ${stroke};" />
          `;
        }).join('')}
      </svg>
    `;
    
    // Render SVG
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    container.appendChild(doc.documentElement);
    
    // Add Mouse Interactive Listeners on Points
    const points = container.querySelectorAll('.chart-point');
    points.forEach(pt => {
      pt.addEventListener('mouseover', (e) => {
        const year = e.target.getAttribute('data-year');
        const val = e.target.getAttribute('data-value');
        
        tooltip.innerHTML = `
          <strong>Year ${year}</strong><br>
          Sex Ratio: ${val}<br>
          <span style="font-size: 0.7rem; color:var(--text-muted)">Females per 1K Males</span>
        `;
        
        const rect = container.getBoundingClientRect();
        const ptX = e.clientX - rect.left;
        const ptY = e.clientY - rect.top;
        
        tooltip.style.left = `${ptX + 15}px`;
        tooltip.style.top = `${ptY - 45}px`;
        tooltip.style.opacity = '1';
      });
      
      pt.addEventListener('mouseout', () => {
        tooltip.style.opacity = '0';
      });
      
      pt.addEventListener('click', (e) => {
        const year = parseInt(e.target.getAttribute('data-year'));
        yearSlider.value = year;
        updateYear(year);
      });
    });
  }

  // --- Dynamic Dashboard Updates ---

  function updateYear(year) {
    currentYear = parseInt(year);
    yearDisplay.textContent = currentYear;
    
    updateYearTicksHighlight();
    renderNationalCards();
    renderSocialCategories();
    renderTable();
    
    // Reposition highlighed year line overlay on charts without redrawing the entire SVG
    // (This prevents resetting zoom/hover states and boosts performance!)
    const container1 = document.getElementById('pop-trend-chart-container');
    const container2 = document.getElementById('ratio-trend-chart-container');
    
    const svg1 = container1.querySelector('svg');
    const svg2 = container2.querySelector('svg');
    
    if (svg1 && svg2) {
      const width1 = svg1.viewBox.baseVal.width;
      const paddingLeft1 = 65; // updated to match drawPopulationChart
      const paddingRight1 = 20;
      const x1 = paddingLeft1 + ((currentYear - 2011) / 15) * (width1 - paddingLeft1 - paddingRight1);
      
      const line1 = svg1.querySelector('#pop-year-line');
      if (line1) {
        line1.setAttribute('x1', x1);
        line1.setAttribute('x2', x1);
      }
      
      const width2 = svg2.viewBox.baseVal.width;
      const paddingLeft2 = 50;
      const paddingRight2 = 20;
      const x2 = paddingLeft2 + ((currentYear - 2011) / 15) * (width2 - paddingLeft2 - paddingRight2);
      
      const line2 = svg2.querySelector('#ratio-year-line');
      if (line2) {
        line2.setAttribute('x1', x2);
        line2.setAttribute('x2', x2);
      }
      
      // Update selected circle highlighting on SVG charts
      const popPoints = svg1.querySelectorAll('.chart-point');
      popPoints.forEach(pt => {
        const ptYear = parseInt(pt.getAttribute('data-year'));
        if (ptYear === currentYear) {
          pt.setAttribute('r', '6');
          pt.setAttribute('fill', '#ffffff');
          pt.setAttribute('stroke', 'var(--primary)');
          pt.setAttribute('stroke-width', '3');
        } else {
          pt.setAttribute('r', '4');
          pt.setAttribute('fill', 'var(--primary)');
          pt.setAttribute('stroke', '#ffffff');
          pt.setAttribute('stroke-width', '2');
        }
      });
      
      const ratioPoints = svg2.querySelectorAll('.chart-point');
      ratioPoints.forEach(pt => {
        const ptYear = parseInt(pt.getAttribute('data-year'));
        if (ptYear === currentYear) {
          pt.setAttribute('r', '6');
          pt.style.fill = '#ffffff';
          pt.setAttribute('fill', '#ffffff');
          pt.style.stroke = 'var(--success)';
          pt.setAttribute('stroke', 'var(--success)');
          pt.setAttribute('stroke-width', '3');
        } else {
          pt.setAttribute('r', '4');
          pt.style.fill = 'var(--success)';
          pt.setAttribute('fill', 'var(--success)');
          pt.style.stroke = '#ffffff';
          pt.setAttribute('stroke', '#ffffff');
          pt.setAttribute('stroke-width', '2');
        }
      });
    } else {
      // If charts haven't been drawn yet, draw them
      drawSVGCharts();
    }
  }

  // Helper to select a region and update the dashboard
  function selectRegion(regionName, updateSearch = true) {
    selectedRegion = regionName;
    
    if (updateSearch) {
      stateSearch.value = regionName === 'India' ? '' : regionName;
      searchFilter = ''; // reset table filter so all rows are visible
    }
    
    // Rerender all components
    renderNationalCards();
    renderSocialCategories();
    renderTable();
    drawSVGCharts();
  }

  // Render Autocomplete Suggestions Dropdown
  const searchDropdown = document.getElementById('search-dropdown');

  function renderDropdownSuggestions(query = '') {
    searchDropdown.innerHTML = '';
    const normalizedQuery = query.toLowerCase().trim();
    
    // Get all regions including 'India'
    const regions = Object.keys(window.DEMOGRAPHICS_DATA).sort((a, b) => {
      if (a === 'India') return -1;
      if (b === 'India') return 1;
      return a.localeCompare(b);
    });

    const matches = regions.filter(r => {
      if (r === 'India') {
        return normalizedQuery === '' || 'india'.includes(normalizedQuery) || 'all'.includes(normalizedQuery);
      }
      return r.toLowerCase().includes(normalizedQuery);
    });

    if (matches.length === 0) {
      searchDropdown.style.display = 'none';
      return;
    }

    matches.forEach((region, index) => {
      const item = document.createElement('div');
      item.className = 'search-dropdown-item';
      
      // Initially highlight the active selected region
      if (region === selectedRegion) {
        item.classList.add('active');
      }

      const isUT = region !== 'India' && isUnionTerritory(region);
      const typeLabel = region === 'India' ? 'Country' : (isUT ? 'UT' : 'State');

      item.innerHTML = `
        <strong>${region}</strong>
        <span class="region-type">${typeLabel}</span>
      `;

      item.addEventListener('click', () => {
        selectRegion(region);
        searchDropdown.style.display = 'none';
      });

      searchDropdown.appendChild(item);
    });

    searchDropdown.style.display = 'block';
  }

  // --- Event Listeners Setup ---

  // Year slider change event
  yearSlider.addEventListener('input', (e) => {
    updateYear(e.target.value);
  });

  // State search input event
  stateSearch.addEventListener('input', (e) => {
    searchFilter = e.target.value.toLowerCase().trim();
    renderTable();
    renderDropdownSuggestions(e.target.value);
  });

  // Show dropdown on focus
  stateSearch.addEventListener('focus', (e) => {
    renderDropdownSuggestions(e.target.value);
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!stateSearch.contains(e.target) && !searchDropdown.contains(e.target)) {
      searchDropdown.style.display = 'none';
    }
  });

  // Keyboard navigation for search dropdown
  stateSearch.addEventListener('keydown', (e) => {
    const items = searchDropdown.querySelectorAll('.search-dropdown-item');
    if (items.length === 0 || searchDropdown.style.display === 'none') return;

    let activeIndex = -1;
    items.forEach((item, idx) => {
      if (item.classList.contains('active-highlight')) {
        activeIndex = idx;
      }
    });

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeIndex !== -1) {
        items[activeIndex].classList.remove('active-highlight');
        items[activeIndex].style.background = '';
      }
      activeIndex = (activeIndex + 1) % items.length;
      items[activeIndex].classList.add('active-highlight');
      items[activeIndex].style.background = 'var(--primary-light)';
      items[activeIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeIndex !== -1) {
        items[activeIndex].classList.remove('active-highlight');
        items[activeIndex].style.background = '';
      }
      activeIndex = (activeIndex - 1 + items.length) % items.length;
      items[activeIndex].classList.add('active-highlight');
      items[activeIndex].style.background = 'var(--primary-light)';
      items[activeIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      if (activeIndex !== -1) {
        e.preventDefault();
        items[activeIndex].click();
      }
    } else if (e.key === 'Escape') {
      searchDropdown.style.display = 'none';
    }
  });

  // Filters toggles click events
  btnFilterAll.addEventListener('click', () => {
    btnFilterAll.classList.add('active');
    btnFilterStates.classList.remove('active');
    btnFilterUTs.classList.remove('active');
    regionFilter = 'all';
    renderTable();
  });

  btnFilterStates.addEventListener('click', () => {
    btnFilterAll.classList.remove('active');
    btnFilterStates.classList.add('active');
    btnFilterUTs.classList.remove('active');
    regionFilter = 'states';
    renderTable();
  });

  btnFilterUTs.addEventListener('click', () => {
    btnFilterAll.classList.remove('active');
    btnFilterStates.classList.remove('active');
    btnFilterUTs.classList.add('active');
    regionFilter = 'uts';
    renderTable();
  });

  // Number Format Toggle click event
  btnToggleNumberFormat.addEventListener('click', () => {
    numberFormatMode = numberFormatMode === 'in' ? 'en' : 'in';
    
    // Update label text
    formatLabel.textContent = numberFormatMode === 'in' ? 'Lakhs / Crores' : 'Millions';
    
    // Rerender all components that are impacted by formatting
    renderNationalCards();
    renderSocialCategories();
    renderTable();
    drawSVGCharts(); // Re-render charts to update axis labels
  });

  // Chart responsiveness (redraw SVGs on window resize)
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      drawSVGCharts();
    }, 250);
  });

  // --- Initializing App ---
  initYearTicks();
  setupSortHeaders();
  
  // Render everything initially
  updateYear(currentYear);
  renderReligionSection();
  renderLiteracySection();
  drawSVGCharts();
});
