<template>
  <div class="row">
    <div class="col-md-4 p-2" id="left-panel">
      <form
        class="p-2 pb-0"
        action="/api/data"
        method="POST"
        name="logFile"
        @submit="submitLogFile"
        enctype="multipart/form-data"
      >
        <div class="my-3">
          <input type="file" @change="setLogFile" class="form-control" />
          <button class="btn btn-primary mt-3 w-100">Submit</button>
        </div>
      </form>
      <div id="more-details" class="mt-0 pt-0" v-show="showMoreDetails">
        <div class="card p-3 count-header text-dark bg-info">
          <h3>{{ totalCount }}</h3>
          <p>Total Count</p>
          <p class="filter-btn" @click="showAllItems()">
            <small>Show all results</small>
          </p>
        </div>
        <div class="card p-3 count-header text-light bg-danger">
          <h3>{{ criticalCount }}</h3>
          <p>Critical Count</p>
          <p
            class="text-light critical-filter-btn"
            @click="filterCriticalItems('CRITICAL')"
          >
            <small>Filter critical data</small>
          </p>
        </div>
        <div class="card p-3 count-header text-dark bg-warning">
          <h3>{{ warningCount }}</h3>
          <p>Warning Count</p>
          <p class="filter-btn" @click="filterCriticalItems('WARNING')">
            <small>Filter warning data</small>
          </p>
        </div>
        <!-- <div class="card">
          <h5 class="card-header">Most Recent Item</h5>
          <div class="card-body">
            <p><b>DATE/TIME:</b> {{ mostRecentItem.asctime }}</p>
            <p><b>NAME:</b> {{ mostRecentItem.name }}</p>
            <p><b>LEVEL:</b> {{ mostRecentItem.levelname }}</p>
            <p><b>MESSAGE:</b> {{ mostRecentItem.message }}</p>
            <p><b>RUN ID:</b>{{ mostRecentItem.run_identifier }}</p>
            <p><b>COMPANY ID:</b> {{ mostRecentItem.company_id }}</p>

            <p><b>DATA CATEGORY:</b> {{ mostRecentItem.data_category }}</p>
            <p>
              <b>REMEDIATION NEEDED:</b> {{ mostRecentItem.remediation_needed }}
            </p>
            <p>
              <b>REMEDIATION STEPS:</b> {{ mostRecentItem.remediation_steps }}
            </p>
            <p><b>PAYROLL ITEM ID:</b> {{ mostRecentItem.payroll_item_id }}</p>
            <p><b>ACTION TAKEN:</b> {{ mostRecentItem.action_taken }}</p>
          </div>
        </div> -->
      </div>
    </div>
    <div class="p-3 col-md-8" v-show="ifItemSelected">
      <h3>Event Log</h3>
      <div id="table-div">
        <table class="table table-striped">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Level</th>
              <th scope="col">Category</th>
              <th scope="col">Needs Remediation</th>
              <th scope="col">Remediation Steps</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredItems"
              :key="item.run_identifier"
              @click="showSelectedItem(item)"
            >
              <td>{{ dateToString(item.asctime) }}</td>
              <td>{{ item.levelname }}</td>
              <td>{{ item.data_category }}</td>
              <td>{{ item.remediation_needed }}</td>
              <td>{{ item.remediation_steps }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="row">
        <div class="col-md-6">
          <div v-if="selectedItem && selectedItem.name" class="selected-item">
            <div class="card">
              <h5 class="card-header">{{ selectedItem.name }}</h5>
              <div class="card-body">
                <p><b>DATE/TIME:</b> {{ selectedItem.asctime }}</p>
                <p><b>LEVEL:</b> {{ selectedItem.levelname }}</p>
                <p><b>MESSAGE:</b> {{ selectedItem.message }}</p>
                <p><b>RUN ID:</b> {{ selectedItem.run_identifier }}</p>
                <p><b>COMPANY ID:</b> {{ selectedItem.company_id }}</p>

                <p><b>DATA CATEGORY:</b> {{ selectedItem.data_category }}</p>
                <p>
                  <b>REMEDIATION NEEDED:</b>
                  {{ selectedItem.remediation_needed }}
                </p>
                <p>
                  <b>REMEDIATION STEPS:</b> {{ selectedItem.remediation_steps }}
                </p>
                <p>
                  <b>PAYROLL ITEM ID:</b> {{ selectedItem.payroll_item_id }}
                </p>
                <p><b>ACTION TAKEN:</b> {{ selectedItem.action_taken }}</p>
              </div>
            </div>
          </div>
          <div
            v-else
            class="d-flex flex-column justify-content-center align-items-center selected-item"
          >
            <h3>No Item Selected</h3>
            <p>Click a table row.</p>
          </div>
        </div>
        <div id="aggregates" class="col-md-6 pt-0 px-3">
          <div class="card p-3 count-header my-2 text-dark bg-info">
            <h3>{{ needsRemediationCount }}</h3>
            <p>Need Remediation</p>
          </div>
          <div class="card p-3 count-header my-2 text-dark bg-info">
            <h3>{{ actionTakenCount }}</h3>
            <p>Action Taken</p>
          </div>
          <div class="card p-3 count-header my-2 text-dark bg-info">
            <h3>{{ todayItemsCount }}</h3>
            <p>Today's Errors</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  async mounted() {
    console.log(this.todayItemsCount);
  },
  computed: {
    showMoreDetails: function () {
      return this.mostRecentItem && this.mostRecentItem.name ? true : false;
    },
    ifItemSelected: function () {
      return this.filteredItems.length > 0 ? true : false;
    },
  },
  methods: {
    showSelectedItem: function (item) {
      this.selectedItem = item;
      return this.selectedItem;
    },
    dateToString: function (date) {
      let spliteDate = date.split(",")[0];
      return new Date(spliteDate).toDateString();
    },
    setLogFile: function (e) {
      this.logFile = e.target.files[0];
    },
    submitLogFile: async function (e) {
      e.preventDefault();
      let formData = this.gatherData();
      const headers = { "Content-Type": "multipart/form-data" };
      const response = await axios.post("api/data", formData, { headers });
      if (response.data.data) {
        this.storedItems = response.data.data;
        this.filteredItems = [...this.storedItems];
        this.mostRecentItem = this.storedItems[0];
        this.totalCount = this.storedItems.length;
        this.criticalCount = this.storedItems.filter(
          (item) => item.levelname === "CRITICAL"
        ).length;
        this.warningCount = this.storedItems.filter(
          (item) => item.levelname === "WARNING"
        ).length;
        this.needsRemediationCount = this.storedItems.filter(
          (item) => item.remediation_needed == true
        ).length;
        this.actionTakenCount = this.storedItems.filter(
          (item) => item.action_taken
        ).length;
        this.todayItemsCount = this.storedItems.filter((item) => {
          let date = new Date();
          return (
            parseInt(item.asctime.split("-")[0]) === date.getFullYear() &&
            parseInt(item.asctime.split("-")[1]) === date.getMonth() + 1 &&
            parseInt(item.asctime.split("-")[2]) === date.getDate()
          );
        }).length;
      }
    },
    gatherData: function () {
      let formData = new FormData();
      formData.append("file", this.logFile);
      return formData;
    },
    filterCriticalItems: function (type) {
      console.log(type);
      this.filteredItems = this.storedItems.filter(
        (item) => item.levelname === type
      );
      console.log(this.filteredItems.length);
      return this.filteredItems;
    },
    showAllItems: function () {
      this.filteredItems = [...this.storedItems];
      console.log(this.filteredItems.length);
      return this.filteredItems;
    },
  },
  name: "LogList",
  props: {
    msg: String,
  },
  data() {
    return {
      storedItems: [],
      filteredItems: [],
      logFile: null,
      mostRecentItem: {},
      selectedItem: {},
      criticalCount: 0,
      warningCount: 0,
      totalCount: 0,
      needsRemediationCount: 0,
      actionTakenCount: 0,
      todayItemsCount: 0,
    };
  },
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
thead,
tbody {
  font-size: 14px;
}
#table-div {
  max-height: 500px;
  overflow-y: auto;
  margin-bottom: 20px;
}
.card {
  font-size: 14px;
}
#left-panel #more-details {
  width: 95%;
  margin: 0 auto;
}
#more-details .card {
  margin-bottom: 10px;
}
.card .card-body p {
  margin: 0;
  padding: 0;
}
#more-details .count-header h3,
#aggregates div h3 {
  font-weight: 800;
  font-size: 30px;
  margin-bottom: 0;
}
.filter-btn {
  color: blue;
}
.filter-btn,
.critical-filter-btn {
  text-decoration: underline;
  cursor: pointer;
  font-size: 16px;
  margin-top: 0px;
  margin-bottom: 0px;
  padding-bottom: 0px;
}
.selected-item,
#aggregates {
  min-height: 300px;
}
</style>
