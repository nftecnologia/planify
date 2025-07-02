import Redis from 'redis';

async function testUpstashRedis() {
  const client = Redis.createClient({
    url: process.env['REDIS_URL']
  });

  try {
    console.log('🔗 Conectando ao Upstash Redis...');
    
    await client.connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testar operações básicas
    console.log('📝 Testando operações...');
    
    // SET
    await client.set('test:financeinfo', 'FinanceInfo Pro conectado!');
    console.log('✅ SET realizado');
    
    // GET
    const value = await client.get('test:financeinfo');
    console.log('✅ GET realizado:', value);
    
    // INFO
    const info = await client.info('server');
    const redisVersion = info.split('\n').find(line => line.startsWith('redis_version:'));
    console.log('🔍 Versão Redis:', redisVersion);
    
    // TTL Test
    await client.setEx('test:ttl', 10, 'expires in 10 seconds');
    const ttl = await client.ttl('test:ttl');
    console.log('⏰ TTL teste:', ttl, 'segundos');
    
    // Cleanup
    await client.del(['test:financeinfo', 'test:ttl']);
    console.log('🧹 Limpeza realizada');
    
  } catch (error) {
    console.error('❌ Erro ao conectar com Upstash Redis:', error);
  } finally {
    await client.quit();
    console.log('👋 Conexão encerrada');
  }
}

testUpstashRedis();