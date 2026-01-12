/**
 * 脚本功能：网络变化 5 秒后，强制触发指定策略组的测速 (Benchmark)
 */

// --- 配置区域 ---
const policyGroupName = "Intranet"; // 需要触发测速的策略组名称
const delayMs = 5000;               // 延迟时间 (毫秒)
// ----------------

(function main() {
    // 延迟执行
    setTimeout(() => {
        triggerGroupTest();
    }, delayMs);
})();

function triggerGroupTest() {
    // 使用 Surge HTTP API 触发测速
    // POST /v1/policy_groups/test
    $httpAPI("POST", "/v1/policy_groups/test", { group_name: policyGroupName }, (result) => {
        
        // 简单的日志输出 (可选)
        if (result && result.error) {
            console.log(`[组测速] 触发失败: ${result.error}`);
        } else {
            console.log(`[组测速] 已触发策略组 "${policyGroupName}" 的重新测速`);
        }
        
        $done();
    });
}