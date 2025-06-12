import fetch from "node-fetch"
const endpoint = "https://programmerraja--af18b72c392911f091ed9e149126039e.web.val.run/analytics"
const apiKey = "YX7EQcpi1x6I5Q9nDK5l6thYh7SPA2"

if (!apiKey) {
  console.error("API key not found. Set API_KEY in environment.")
  process.exit(1)
}

function pad(str, length) {
  return str.padEnd(length, " ")
}

function truncateAndPad(str, maxLength, padTo) {
  if (str.length > maxLength) {
    str = str.slice(0, maxLength - 3) + "..."
  }
  return str.padEnd(padTo, " ")
}

function parseDate(timestamp) {
  return new Date(timestamp)
}

async function fetchVisitors() {
  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "x-key": apiKey,
      },
    })
    if (!res.ok) throw new Error(`HTTP error! ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error("Failed to fetch visitors:", err)
    return null
  }
}

function analyzeVisitors(visitors) {
  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const monthAgo = new Date(now)
  monthAgo.setMonth(monthAgo.getMonth() - 1)
  const yearAgo = new Date(now)
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)

  let weekly = 0,
    monthly = 0,
    yearly = 0
  const referrerCounts = {}
  const postCounts = {}

  visitors.forEach((visitor) => {
    const date = parseDate(visitor.timestamp)
    if (date >= weekAgo) weekly++
    if (date >= monthAgo) monthly++
    if (date >= yearAgo) yearly++

    const ref = visitor.referrer || "Direct"
    referrerCounts[ref] = (referrerCounts[ref] || 0) + 1

    let path
    try {
      path = new URL(visitor.url).pathname
    } catch {
      path = visitor.url
    }
    postCounts[path] = (postCounts[path] || 0) + 1
  })

  const refPad = 43
  const maxRefLen = 40
  console.log("\n=== Visitor Statistics ===")
  console.log(pad("Total", refPad) + `: ${visitors.length} visitors`)
  console.log(pad("Last 7 days", refPad) + `: ${weekly} visitors`)
  console.log(pad("Last 30 days", refPad) + `: ${monthly} visitors`)
  console.log(pad("Last Year", refPad) + `: ${yearly} visitors`)

  console.log("\n=== Most Visited Posts ===")
  const sortedPosts = Object.entries(postCounts).sort((a, b) => b[1] - a[1])
  for (const [url, count] of sortedPosts) {
    const label = url || "Home Page"
    console.log(pad(label, refPad) + `: ${count} visits`)
  }

  console.log("\n=== Top Referrers ===")
  const sortedReferrers = Object.entries(referrerCounts).sort((a, b) => b[1] - a[1])

  for (const [ref, count] of sortedReferrers) {
    const label = truncateAndPad(ref, maxRefLen, refPad)
    console.log(`${label}: ${count} visitors`)
  }
}

;(async () => {
  const visitors = await fetchVisitors()
  // console.log(visitors)
  if (visitors) analyzeVisitors(visitors)
})()
