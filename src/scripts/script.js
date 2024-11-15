import axios from "axios";
import { LMap, LTileLayer, LMarker, LPopup } from "vue3-leaflet";
import "leaflet/dist/leaflet.css";
import * as echarts from "echarts";
import { nextTick } from "vue";

export default {
  components: { LMap, LTileLayer, LMarker, LPopup },
  data() {
    return {
      countries: [],
      selectedCountry: null,
      selectedView: "text",
      populationData: [],
      mapCenter: [20, 0],
      echartInstance: null,
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
    filteredPopulationData() {
      return this.populationData.filter((entry) => entry.value !== null);
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
      if (newView === "echart") {
        nextTick(() => this.renderEChart());
      } else if (newView === "map") {
        this.updateMapCenter();
      }
    },
    populationData() {
      if (this.selectedView === "echart") {
        this.renderEChart();
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
      this.fetchPopulationData(); // Ensure population data is re-fetched
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
    renderEChart() {
      if (this.echartInstance) {
        this.echartInstance.dispose();
      }

      const chartDom = document.getElementById("populationChart");
      this.echartInstance = echarts.init(chartDom);

      const option = {
        title: {
          text: "Population Over Years",
          left: "center",
          textStyle: {
            color: "#f8f9fa",
            fontWeight: "bold",
            fontSize: 18,
          },
        },
        tooltip: {
          trigger: "axis",
          formatter: (params) => {
            return `${params[0].name}: ${params[0].value.toLocaleString()}`;
          },
        },
        xAxis: {
          type: "category",
          data: this.chartLabels,
          axisLine: { lineStyle: { color: "#f8f9fa" } },
          axisLabel: { color: "#f8f9fa" },
        },
        yAxis: {
          type: "value",
          axisLabel: {
            formatter: "{value}",
            color: "#f8f9fa",
          },
          axisLine: { lineStyle: { color: "#f8f9fa" } },
        },
        series: [
          {
            data: this.chartDataValues,
            type: "line",
            smooth: true,
            itemStyle: {
              color: "#4facfe",
            },
            areaStyle: {
              color: "rgba(79, 172, 254, 0.2)",
            },
          },
        ],
      };

      this.echartInstance.setOption(option);
    },
  },
  mounted() {
    this.fetchCountries();
    this.loadSettings();
    this.fetchPopulationData();
  },
};
