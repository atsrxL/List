// 策略组和节点配置
const GROUP_NAME = "Intranet";
const NODES = ["Direct", "SS61121", "DEVICE:MACMINI", "DEVICE:M4"];
const PING_TARGET = "192.168.123.99";
const PING_INTERVAL = 10; // 秒

// 当前使用的节点索引
let currentNodeIndex = 0;

// 从持久化存储中读取上次使用的节点索引
const savedIndex = $persistentStore.read("currentNodeIndex");
if (savedIndex !== null) {
    currentNodeIndex = parseInt(savedIndex);
}

// 测试连接
async function testConnection() {
    return new Promise((resolve) => {
        $httpClient.get({
            url: `http://${PING_TARGET}`,
            timeout: 3,
        }, function(error, response, data) {
            if (error) {
                console.log(`Ping ${PING_TARGET} failed: ${error}`);
                resolve(false);
            } else {
                console.log(`Ping ${PING_TARGET} successful`);
                resolve(true);
            }
        });
    });
}

// 切换到下一个节点
async function switchToNextNode() {
    // 计算下一个节点索引
    currentNodeIndex = (currentNodeIndex + 1) % NODES.length;
    
    // 保存当前节点索引到持久化存储
    $persistentStore.write(currentNodeIndex.toString(), "currentNodeIndex");
    
    // 选择新节点
    const nextNode = NODES[currentNodeIndex];
    console.log(`Switching to node: ${nextNode}`);
    
    // 调用 Surge HTTP API 切换节点
    $httpAPI("POST", `/policy_groups/${encodeURIComponent(GROUP_NAME)}`, {
        policy: nextNode
    }, function(result) {
        if (result.error) {
            console.log(`Failed to switch node: ${result.error}`);
        } else {
            console.log(`Successfully switched to ${nextNode}`);
        }
    });
}

// 主逻辑
async function main() {
    const isConnected = await testConnection();
    
    if (!isConnected) {
        await switchToNextNode();
    } else {
        console.log(`Connection is good, staying with current node: ${NODES[currentNodeIndex]}`);
    }
    
    $done();
}

main();