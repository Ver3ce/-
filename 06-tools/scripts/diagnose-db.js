/**
 * 数据库连接诊断工具
 * 运行: node scripts/diagnose-db.js
 */

import { testConnection } from '../api/queries/connection.ts';

console.log('🔍 正在诊断数据库连接...\n');

async function diagnose() {
  try {
    const result = await testConnection();
    
    if (result.ok) {
      console.log('✅ 数据库连接成功');
      console.log(`📊 ${result.message}\n`);
      process.exit(0);
    } else {
      console.log('❌ 数据库连接失败');
      console.log(`💥 错误信息: ${result.message}\n`);
      console.log('🔧 可能的解决方案:');
      console.log('   1. 检查 MySQL 服务是否正在运行');
      console.log('   2. 检查数据库用户名和密码是否正确');
      console.log('   3. 检查数据库 "aurora_career" 是否已创建');
      console.log('   4. 检查 .env 文件中的 DATABASE_URL 配置\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 诊断过程中发生错误:', error);
    process.exit(1);
  }
}

diagnose();
