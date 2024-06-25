const axios = require("axios");
const fs = require("fs-extra");
const execSync = require("child_process").execSync;
const path = require('path');

const dirBootLogTemp = path.join(__dirname, "../tmp", "rebootUpdated.txt");

module.exports = {
    description: "Check for and install updates for the chatbot, and restart if necessary.",
    role: "admin",
    cooldown: 2,
    credits: "CJ",
    execute: async function (api, event, args, commands) {
        const currentVersion = require("../package.json").version;

        try {
            // Notify user that update process is starting
            api.sendMessage("Updating Repository...", event.threadID);

            // Paste your github package.json link repo, for example.
            const response = await axios.get("https://raw.githubusercontent.com/Username/OctoBotRemake/main/package.json");
            const latestVersion = response.data.version;

            // Check if an update is necessary
            if (compareVersion(latestVersion, currentVersion) <= 0) {
                setTimeout(() => {
                    return api.sendMessage(`✅ | You are using the latest version (v${currentVersion}).`, event.threadID);
                }, 3000);
            } else {
                // Simulate updating process with a delay
                setTimeout(async () => {
                    api.sendMessage("🚀 | Updating...", event.threadID);

                    try {
                        // Run the update command for the entire repository
                        execSync("git pull origin main", { stdio: "inherit" });

                        // Record the thread ID for post-restart notification
                        fs.writeFileSync(dirBootLogTemp, event.threadID);

                        // After another delay, notify update success and show new version
                        setTimeout(() => {
                            api.sendMessage(`✅ | Update complete! You are now using version ${latestVersion}. Restarting now...`, event.threadID, (err, info) => {
                                if (err) return console.error(err);

                                process.exit(2);
                            });
                        }, 4000);
                    } catch (error) {
                        console.error('Error during update:', error);
                        api.sendMessage("⚠️ | An error occurred while updating the bot.", event.threadID);
                    }
                }, 3000);
            }
        } catch (error) {
            console.error('Error fetching the latest version:', error);
            api.sendMessage("⚠️ | An error occurred while checking for updates.", event.threadID);
        }
    }
};

function compareVersion(version1, version2) {
    const v1 = version1.split(".");
    const v2 = version2.split(".");
    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
        const num1 = parseInt(v1[i]) || 0;
        const num2 = parseInt(v2[i]) || 0;
        if (num1 > num2) return 1;
        if (num1 < num2) return -1;
    }
    return 0;
}
