<template>
  <div id="app">
    <header class="header">
      <h1 class="title">🌍 World Population Visualization</h1>
    </header>

    <div class="control-panel">
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
          <option value="echart">ECharts Graph</option>
        </select>
      </div>
    </div>

    <section v-if="selectedView === 'text'" class="content-display fade-in">
      <h3>Population Data by Year</h3>
      <ul class="data-list">
        <li
          v-for="entry in filteredPopulationData"
          :key="entry.date"
          class="data-item"
        >
          <span class="year">Year: {{ entry.date }}</span>
          <span class="population">
            Population:
            {{
              entry.value ? entry.value.toLocaleString() : "Data not available"
            }}
          </span>
        </li>
      </ul>
    </section>

    <section v-if="selectedView === 'map'" class="map-section fade-in">
      <l-map
        ref="mapRef"
        :zoom="2"
        :center="mapCenter"
        style="height: 500px; width: 100%"
      >
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <l-marker :lat-lng="mapCenter">
          <l-popup>{{ countryName }}</l-popup>
        </l-marker>
      </l-map>
    </section>

    <section v-if="selectedView === 'echart'" class="graph-section fade-in">
      <div id="populationChart" style="width: 100%; height: 500px"></div>
    </section>
  </div>
</template>

<script src="./scripts/script.js"></script>
<style src="./styles/style.css"></style>
