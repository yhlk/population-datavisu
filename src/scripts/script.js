import axios from "axios";
import { LMap, LTileLayer, LMarker, LPopup } from "vue3-leaflet";
import "leaflet/dist/leaflet.css";
import Chart from "chart.js/auto";
import { nextTick } from "vue";

export default {
  components: { LMap, LTileLayer, LMarker, LPopup },
  data() {
    return {
      countries: [],
      selectedCountry: null,
      selectedView: "text",
      selectedChartType: "line",
      populationData: [],
      mapCenter: [20, 0],
      chart: null,
    };
  },
  computed: {
    countryName() {
      const country = this.countries.find((c) => c.id === this.selectedCountry);
      return country ? country.name : "";
    },
    chartLabels() {
      return this.populationData.map((entry) => entry.date).reverse();
    },
    chartDataValues() {
      return this.populationData.map((entry) => entry.value).reverse();
    },
  },
  watch: {
    selectedCountry(newCountry) {
      if (newCountry) {
        this.fetchPopulationData();
        this.updateMapCenter();
      }
    },
    selectedView(newView) {
      if (newView === "graph") {
        nextTick(() => this.renderChart());
      } else if (newView === "map") {
        this.updateMapCenter();
      }
    },
  },
  methods: {
    async fetchCountries() {
      try {
        const response = await axios.get(
          "https://api.worldbank.org/v2/country?format=json&per_page=300"
        );
        this.countries = response.data[1];
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    },
    async fetchPopulationData() {
      if (!this.selectedCountry) return;
      try {
        const response = await axios.get(
          `https://api.worldbank.org/v2/country/${this.selectedCountry}/indicator/SP.POP.TOTL?format=json`
        );
        this.populationData = response.data[1] || [];
      } catch (error) {
        console.error("Error fetching population data:", error);
      }
    },
    updateMapCenter() {
      const country = this.countries.find((c) => c.id === this.selectedCountry);
      if (country && country.latitude && country.longitude) {
        this.mapCenter = [country.latitude, country.longitude];
        if (this.$refs.mapRef) {
          this.$refs.mapRef.mapObject.setView(this.mapCenter, 4, {
            animate: true,
          });
        }
      }
    },
    handleCountryChange() {
      localStorage.setItem("selectedCountry", this.selectedCountry);
      localStorage.setItem("selectedView", "text");
      window.location.reload();
    },
    handleViewChange() {
      localStorage.setItem("selectedView", this.selectedView);
    },
    loadSettings() {
      const storedCountry = localStorage.getItem("selectedCountry");
      if (storedCountry) {
        this.selectedCountry = storedCountry;
      }
      this.selectedView = "text";
    },
    renderChart() {
      if (this.chart) {
        this.chart.destroy();
      }

      const ctx = document.getElementById("populationChart").getContext("2d");
      this.chart = new Chart(ctx, {
        type: this.selectedChartType,
        data: {
          labels: this.chartLabels,
          datasets: [
            {
              label: "Population",
              data: this.chartDataValues,
              borderColor: "#007bff",
              borderWidth: 2,
              backgroundColor: "rgba(0, 123, 255, 0.2)",
              fill: this.selectedChartType !== "line",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `${
                    context.dataset.label
                  }: ${context.raw.toLocaleString()}`;
                },
              },
            },
          },
        },
      });
    },
  },
  mounted() {
    this.fetchCountries();
    this.loadSettings();
    this.fetchPopulationData();
  },
};
