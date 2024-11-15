<template>
  <div id="app">
    <header class="header">
      <h1 class="title">🌍 World Population Visualization</h1>
      <div class="dropdowns">
        <div class="dropdown">
          <label>Select Country:</label>
          <select v-model="selectedCountry" @change="handleCountryChange">
            <option value="" disabled>Select a country</option>
            <option
              v-for="country in countries"
              :key="country.id"
              :value="country.id"
            >
              {{ country.name }}
            </option>
          </select>
        </div>

        <div class="view-selection">
          <label>Choose View:</label>
          <select v-model="selectedView" @change="handleViewChange">
            <option value="text">Plain Text</option>
            <option value="map">Map</option>
            <option value="graph">Graph</option>
          </select>
        </div>

        <div v-if="selectedView === 'graph'" class="graph-type-selection">
          <label>Choose Graph Type:</label>
          <select v-model="selectedChartType" @change="renderChart">
            <option value="line">Line</option>
            <option value="bar">Bar</option>
            <option value="radar">Radar</option>
          </select>
        </div>
      </div>
    </header>

    <!-- Display Based on Selected View -->
    <div v-if="selectedView === 'text'" class="data-display">
      <h3>Population Data by Year</h3>
      <ul>
        <li v-for="entry in populationData" :key="entry.date" class="data-item">
          <span class="year">Year: {{ entry.date }}</span>
          <span class="population"
            >Population: {{ entry.value.toLocaleString() }}</span
          >
        </li>
      </ul>
    </div>

    <!-- Map View -->
    <div v-if="selectedView === 'map'" class="map-container">
      <l-map
        ref="mapRef"
        :zoom="2"
        :center="mapCenter"
        style="height: 600px; width: 100%"
      >
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <l-marker :lat-lng="mapCenter">
          <l-popup>{{ countryName }}</l-popup>
        </l-marker>
      </l-map>
    </div>

    <!-- Graph View with Chart.js -->
    <div v-if="selectedView === 'graph'" class="graph-container">
      <canvas id="populationChart" width="400" height="400"></canvas>
    </div>
  </div>
</template>

<script src="./scripts/script.js"></script>
<style src="./styles/style.css"></style>
