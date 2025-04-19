// Ping Test for Intranet Policy Group
const GROUP_NAME = "Intranet";
const TEST_IP = "192.168.123.99";
const TIMEOUT = 2; // seconds
const INTERVAL = 10; // seconds
const DEBUG = true;

let policy_list = ["DEVICE:MACMINI", "DIRECT", "SS61121", "DEVICE:M4"];
let current_index = 0;

async function ping(ip) {
    return new Promise((resolve) => {
        $httpClient.get({
            url: `http://${ip}`,
            timeout: TIMEOUT
        }, (error, response, data) => {
            if (error) {
                if (DEBUG) console.log(`Ping ${ip} failed: ${error}`);
                resolve(false);
            } else {
                if (DEBUG) console.log(`Ping ${ip} successful`);
                resolve(true);
            }
        });
    });
}

async function getCurrentPolicy() {
    return new Promise((resolve) => {
        $httpAPI("GET", "/v1/policy_groups/select", { 
            group_name: GROUP_NAME 
        }, (result) => {
            if (result.error) {
                console.log(`Failed to get current policy: ${result.error}`);
                resolve(null);
            } else {
                resolve(result.policy);
            }
        });
    });
}

async function setPolicy(policy) {
    return new Promise((resolve) => {
        $httpAPI("POST", "/v1/policy_groups/select", {
            group_name: GROUP_NAME,
            policy: policy
        }, (result) => {
            if (result.error) {
                console.log(`Failed to set policy to ${policy}: ${result.error}`);
                resolve(false);
            } else {
                console.log(`Successfully switched to ${policy}`);
                resolve(true);
            }
        });
    });
}

async function getAvailablePolicies() {
    return new Promise((resolve) => {
        $httpAPI("GET", "/v1/policy_groups", null, (result) => {
            if (result.error) {
                console.log(`Failed to get policy groups: ${result.error}`);
                resolve([]);
            } else {
                for (let group of result) {
                    if (group.name === GROUP_NAME) {
                        resolve(group.candidates);
                        return;
                    }
                }
                resolve([]);
            }
        });
    });
}

async function main() {
    try {
        // 获取可用策略
        const available_policies = await getAvailablePolicies();
        if (available_policies.length > 0) {
            policy_list = available_policies;
        }
        
        // 获取当前策略
        const current_policy = await getCurrentPolicy();
        if (current_policy) {
            current_index = policy_list.indexOf(current_policy);
            if (current_index === -1) current_index = 0;
        }
        
        // 测试当前策略是否可用
        const isAvailable = await ping(TEST_IP);
        
        if (!isAvailable) {
            // 当前策略不可用，切换到下一个
            current_index = (current_index + 1) % policy_list.length;
            await setPolicy(policy_list[current_index]);
        } else {
            console.log(`Current policy ${policy_list[current_index]} is working fine, keeping it.`);
        }
    } catch (error) {
        console.log(`Error in main function: ${error}`);
    }
    
    $done();
}

main();