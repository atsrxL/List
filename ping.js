// 检测内网IP是否可达，如不可达则切换策略组，并显示当前节点延迟
const targetIP = "192.168.123.99";
const policyGroupName = "Intranet";
const timeoutSeconds = 2; // 超时设置为2秒

// 获取当前策略组信息
let currentNode = $surge.selectGroupDetails().decisions[policyGroupName];
let allNodes = $surge.selectGroupDetails().groups[policyGroupName];

// 获取当前节点的延迟
let latency = $surge.latencyTest(currentNode);
console.log(`当前节点: ${currentNode}, 延迟: ${latency}ms`);

// 使用ping命令检测目标IP是否可达
$httpClient.get({
  url: `http://${targetIP}`,
  timeout: timeoutSeconds * 1000 // 转换为毫秒
}, function(error, response, data) {
  if (error) {
    console.log(`${targetIP} 不可达，当前节点: ${currentNode}, 延迟: ${latency}ms`);
    
    // 找到当前节点在列表中的位置
    let currentIndex = allNodes.indexOf(currentNode);
    let nextIndex = (currentIndex + 1) % allNodes.length;
    let nextNode = allNodes[nextIndex];
    
    // 实际执行切换操作
    $surge.setSelectGroupPolicy(policyGroupName, nextNode);
    
    // 获取新节点的延迟
    let newLatency = $surge.latencyTest(nextNode);
    console.log(`已切换到下一个节点: ${nextNode}, 延迟: ${newLatency}ms`);
    $done();
  } else {
    console.log(`${targetIP} 可达，保持当前节点: ${currentNode}, 延迟: ${latency}ms`);
    $done();
  }
});