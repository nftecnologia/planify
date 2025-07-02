const redis = require('redis');

async function testRedis() {
  const client = redis.createClient({
    url: 'redis://default:AXBPAAIjcDEyNTk0NTFiNjc1YTQ0ZjAwYjc5OWNhYzE2NTIzZGQzOXAxMA@equipped-buzzard-28751.upstash.io:6379'
  });

  try {
    console.log('🔗 Conectando ao Upstash Redis...');
    await client.connect();
    console.log('✅ Conexão estabelecida!');
    
    // Teste SET/GET
    await client.set('financeinfo:nodejs', 'Conectado via Node.js!');
    const value = await client.get('financeinfo:nodejs');
    console.log('📝 Valor recuperado:', value);
    
    // Teste TTL
    await client.setEx('financeinfo:ttl', 30, 'Expira em 30 segundos');
    const ttl = await client.ttl('financeinfo:ttl');
    console.log('⏰ TTL:', ttl, 'segundos');
    
    console.log('🎉 Upstash Redis funcionando perfeitamente!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.quit();
  }
}

testRedis();