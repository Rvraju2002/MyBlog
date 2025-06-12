const axios = require("axios");

const BASE_URL = "https://cutshort.io/findjobs/q";
const PARAMS = {
  page: 1,
  tags: "fullstack",
  minsal: 2200000,
  salaryCurrency: "INR",
  minexp: 0,
  maxexp: 3,
  remoteType: "remote_not_okay-remote_okay",
  skills: "00306",
};

const HEADERS = {
  Cookie:
    "cs_fe_uuid=c672195a-b521-4ea2-9219-e69599bb2843; cutshort_authentication=s%3AtPvrIX1HubmOXrqGwP26Bosd2gw5r9xD.d642Tz772RhA6XkZXuNdD%2FfswXqMOkX3i7iZavjK%2Fic; first_landed_on_page=https%3A%2F%2Fcutshort.io%2Fjob%2FFullstack-Developer-Chennai-PandoCorp-rRCGxuIC%3Futm_source%3Dlinkedin-feed%26utm_medium%3Dxml%26utm_content%3Djob-posting%26applicationsource%3Dlinkedin-feed; cssid=1743210280000DInZHWEh; _gcl_au=1.1.799060607.1743210283; _gid=GA1.2.888620936.1743210283; _lfa=LF1.1.fb0887f2fe7381c2.1743210283094; _clck=15a3bvr%7C2%7Cfum%7C0%7C1914; _fbp=fb.1.1743210283481.800409593806289260; twk_idm_key=jpwTupceezeOx9bVestZW; last_url_params=%7B%22redirect_url%22%3A%22%252Fprofile%252Fall-jobs%22%7D; cs_sub_dom_id=mngIimnpPpAUXbno; user_logged_in_once=true; NPS_70fac5bc_last_seen=1743219228992; NPS_70fac5bc_throttle=1743262429434; _ga=GA1.2.1504798610.1743210283; _ga_4M54T1S5KY=GS1.1.1743219424.2.1.1743220019.59.0.0; _ga_68L6VENFLX=GS1.1.1743219424.2.1.1743220020.0; TawkConnectionTime=0; twk_uuid_675adabfaf5bfec1dbdaf5fd=%7B%22uuid%22%3A%221.70iICcfzxQMEwvkN3BeiITc5YHWuOx5aXNijDNWU4vgdFRJcfCQGTCF08YbPTyikh3FYuN2kMhR5eBQd1ntWHFptEXEnXm8TSfMJozLBVJNm0YyYCnDg%22%2C%22version%22%3A3%2C%22domain%22%3A%22cutshort.io%22%2C%22ts%22%3A1743220020541%7D; _clsk=fi12n4%7C1743220021776%7C20%7C1%7Cw.clarity.ms%2Fcollect; XSRF-TOKEN=5XmrGDiO-b8c-ZPEFBfEryke5tIDNX6Lvc8U",
};

const fs = require("fs");

const TAMIL_NADU_CITIES = [
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Trichy",
  "Salem",
  "Erode",
  "Tirunelveli",
  "Vellore",
].map((k) => k.toLowerCase());

async function fetchJobs() {
  let currentPage = 1;
  let totalPages = 1;

  const jobs = [];

  while (currentPage <= totalPages) {
    console.log(currentPage, totalPages);
    try {
      const response = await axios.get(BASE_URL, {
        params: { ...PARAMS, page: currentPage },
        headers: HEADERS,
      });
      const data = response.data;

      if (currentPage === 1) {
        totalPages = data.totalPages;
      }

      data.results.forEach((job) => {
        if (job.companyid && job.companyid.locations) {
          const companyLocations = job.companyid.locations;
          if (
            companyLocations.some((loc) =>
              TAMIL_NADU_CITIES.includes(loc.toLowerCase())
            )
          ) {
            jobs.push({
              company: {
                name: job.companyDetails.name,
                stage: job.companyDetails.stage,
                type: job.companyDetails.type,
              },
              role: job.headline,
              salaryRange: job.salaryRange,
              skill: Object.keys(job.allSkillsObj).map(
                (k) => job.allSkillsObj[k]
              ),
              location: job.locationsText,
            });
          }
        }
      });

      currentPage++;
    } catch (error) {
      console.error(`Error fetching page ${currentPage}:`, error.message);
      break;
    }
  }

  fs.writeFileSync("./jobs.json", JSON.stringify(jobs));
}

fetchJobs();


function sum(a,b){
  const total  = a+b;
  console.log("Ss")
}