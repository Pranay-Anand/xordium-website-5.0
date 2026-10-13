const http = require("http");

function makeRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on("error", (e) => reject(e));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function test() {
  // Test 1: Login as owner
  console.log("=== Test 1: Owner Login ===");
  const ownerRes = await makeRequest(
    {
      hostname: "localhost",
      port: 4000,
      path: "/api/auth/login",
      method: "POST",
    },
    { email: "convenor@xordium.ignite.bit.in", password: "OwnerPass123!" }
  );
  console.log("Status:", ownerRes.statusCode);
  if (ownerRes.statusCode === 200) {
    const user = JSON.parse(ownerRes.body);
    console.log("User role:", user.user.role);
    console.log("User email:", user.user.email);
    const token = user.token;
    
    // Test 2: Try admin routes with owner token
    console.log("\n=== Test 2: Owner Access Admin Users ===");
    const adminRes = await makeRequest({
      hostname: "localhost",
      port: 4000,
      path: "/api/admin/users",
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-user-role": "owner",
        "x-user-email": "convenor@xordium.ignite.bit.in",
      },
    });
    console.log("Status:", adminRes.statusCode);
    if (adminRes.statusCode === 200) {
      console.log("Users:", adminRes.body.substring(0, 200));
    }
    
    // Test 3: Try moderator routes
    console.log("\n=== Test 3: Owner Access Moderator Promote ===");
    const promoteRes = await makeRequest({
      hostname: "localhost",
      port: 4000,
      path: "/api/admin/moderators/promote",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-user-role": "owner",
        "x-user-email": "convenor@xordium.ignite.bit.in",
        "Content-Type": "application/json",
      },
      body: { targetUserId: 999 }, // Non-existent user
    });
    console.log("Status:", promoteRes.statusCode);
    console.log("Response:", promoteRes.body.substring(0, 200));
    
    // Test 4: Moderator access (can't promote)
    console.log("\n=== Test 4: Moderator Access (should be forbidden) ===");
    const moderatorToken = `demo-token-moderator-${Date.now()}`;
    const moderatorRes = await makeRequest({
      hostname: "localhost",
      port: 4000,
      path: "/api/admin/moderators/promote",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${moderatorToken}`,
        "x-user-role": "moderator",
        "x-user-email": "mod@test.com",
        "Content-Type": "application/json",
      },
      body: { targetUserId: 1 },
    });
    console.log("Status:", moderatorRes.statusCode);
    console.log("Response:", moderatorRes.body.substring(0, 200));
    
    // Test 5: Regular event access
    console.log("\n=== Test 5: Public Events Access ===");
    const eventsRes = await makeRequest({
      hostname: "localhost",
      port: 4000,
      path: "/api/events",
      method: "GET",
    });
    console.log("Status:", eventsRes.statusCode);
    const events = JSON.parse(eventsRes.body);
    console.log("Events count:", events.length);
  } else {
    console.log("Login failed:", ownerRes.body.substring(0, 200));
  }
}

test().catch(console.error);