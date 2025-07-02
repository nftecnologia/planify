'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Shield, Smartphone, Key, Activity, LogOut, Trash2, Eye, MapPin, Clock, AlertTriangle, QrCode } from 'lucide-react';

interface SecuritySession {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActivity: string;
  isCurrent: boolean;
  browser: string;
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  ip: string;
  location: string;
  success: boolean;
}

interface AppPassword {
  id: string;
  name: string;
  created: string;
  lastUsed: string;
}

export function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [suspiciousActivity, setSuspiciousActivity] = useState(true);

  const [sessions] = useState<SecuritySession[]>([
    {
      id: '1',
      device: 'MacBook Pro',
      location: 'São Paulo, SP',
      ip: '192.168.1.100',
      lastActivity: '2024-01-15 14:30:00',
      isCurrent: true,
      browser: 'Chrome 120.0',
    },
    {
      id: '2',
      device: 'iPhone 15',
      location: 'São Paulo, SP',
      ip: '192.168.1.101',
      lastActivity: '2024-01-15 12:15:00',
      isCurrent: false,
      browser: 'Safari Mobile',
    },
    {
      id: '3',
      device: 'Windows PC',
      location: 'Rio de Janeiro, RJ',
      ip: '201.23.45.67',
      lastActivity: '2024-01-14 18:45:00',
      isCurrent: false,
      browser: 'Firefox 121.0',
    },
  ]);

  const [activityLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      action: 'Login realizado',
      timestamp: '2024-01-15 14:30:00',
      ip: '192.168.1.100',
      location: 'São Paulo, SP',
      success: true,
    },
    {
      id: '2',
      action: 'Tentativa de login falhada',
      timestamp: '2024-01-15 14:25:00',
      ip: '201.23.45.67',
      location: 'Rio de Janeiro, RJ',
      success: false,
    },
    {
      id: '3',
      action: 'Alteração de senha',
      timestamp: '2024-01-14 10:15:00',
      ip: '192.168.1.100',
      location: 'São Paulo, SP',
      success: true,
    },
    {
      id: '4',
      action: 'Login realizado',
      timestamp: '2024-01-14 09:30:00',
      ip: '192.168.1.101',
      location: 'São Paulo, SP',
      success: true,
    },
    {
      id: '5',
      action: 'Exportação de dados',
      timestamp: '2024-01-13 16:45:00',
      ip: '192.168.1.100',
      location: 'São Paulo, SP',
      success: true,
    },
  ]);

  const [appPasswords, setAppPasswords] = useState<AppPassword[]>([
    {
      id: '1',
      name: 'Aplicativo Mobile',
      created: '2024-01-10 10:00:00',
      lastUsed: '2024-01-15 14:30:00',
    },
  ]);

  const handleEnableTwoFactor = () => {
    setShowTwoFactorSetup(true);
  };

  const handleConfirmTwoFactor = () => {
    setTwoFactorEnabled(true);
    setShowTwoFactorSetup(false);
    toast({
      title: 'Autenticação de dois fatores ativada',
      description: 'Sua conta agora está mais segura com 2FA.',
    });
  };

  const handleDisableTwoFactor = () => {
    setTwoFactorEnabled(false);
    toast({
      title: 'Autenticação de dois fatores desativada',
      description: 'A autenticação de dois fatores foi removida da sua conta.',
    });
  };

  const handleRevokeSession = (_sessionId: string) => {
    toast({
      title: 'Sessão revogada',
      description: 'A sessão foi encerrada com sucesso.',
    });
  };

  const handleCreateAppPassword = () => {
    const newPassword: AppPassword = {
      id: Date.now().toString(),
      name: 'Nova Senha de App',
      created: new Date().toLocaleString('pt-BR'),
      lastUsed: 'Nunca',
    };
    setAppPasswords([...appPasswords, newPassword]);
    toast({
      title: 'Senha de aplicativo criada',
      description: 'Uma nova senha para aplicativos foi gerada: app_pass_' + newPassword.id.slice(-6),
    });
  };

  const handleDeleteAppPassword = (passwordId: string) => {
    setAppPasswords(appPasswords.filter(p => p.id !== passwordId));
    toast({
      title: 'Senha removida',
      description: 'A senha de aplicativo foi revogada.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Autenticação de Dois Fatores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Autenticação de Dois Fatores (2FA)
          </CardTitle>
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label>Status da Autenticação 2FA</Label>
                {twoFactorEnabled ? (
                  <Badge className="bg-green-100 text-green-800">Ativado</Badge>
                ) : (
                  <Badge variant="secondary">Desativado</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {twoFactorEnabled 
                  ? 'Sua conta está protegida com autenticação de dois fatores'
                  : 'Ative a autenticação de dois fatores para maior segurança'
                }
              </p>
            </div>
            {twoFactorEnabled ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Desativar 2FA
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Desativar Autenticação de Dois Fatores</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja desativar a autenticação de dois fatores? 
                      Isso tornará sua conta menos segura.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDisableTwoFactor}>
                      Desativar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button onClick={handleEnableTwoFactor}>
                <Smartphone className="h-4 w-4 mr-2" />
                Ativar 2FA
              </Button>
            )}
          </div>

          {showTwoFactorSetup && (
            <div className="p-4 border rounded-lg space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Configurar Autenticação de Dois Fatores
              </h4>
              <ol className="text-sm space-y-2 text-muted-foreground">
                <li>1. Instale um aplicativo autenticador (Google Authenticator, Authy, etc.)</li>
                <li>2. Escaneie o QR Code abaixo ou insira a chave manualmente</li>
                <li>3. Digite o código de 6 dígitos gerado pelo app</li>
              </ol>
              
              <div className="flex justify-center p-4 border-2 border-dashed rounded-lg">
                <div className="text-center space-y-2">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-gray-400" />
                  </div>
                  <p className="text-xs text-muted-foreground">QR Code aqui</p>
                  <p className="text-xs font-mono">JBSWY3DPEHPK3PXP</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-code">Código de Verificação</Label>
                <Input
                  id="verification-code"
                  placeholder="Digite o código de 6 dígitos"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleConfirmTwoFactor}>
                  Confirmar e Ativar
                </Button>
                <Button variant="outline" onClick={() => setShowTwoFactorSetup(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Senhas de Aplicativo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Senhas de Aplicativo
          </CardTitle>
          <CardDescription>
            Gere senhas específicas para aplicativos e integrações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Use senhas de aplicativo para acessos via API ou aplicativos de terceiros
            </p>
            <Button onClick={handleCreateAppPassword} size="sm">
              <Key className="h-4 w-4 mr-2" />
              Nova Senha
            </Button>
          </div>

          {appPasswords.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Último uso</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appPasswords.map((password) => (
                  <TableRow key={password.id}>
                    <TableCell className="font-medium">{password.name}</TableCell>
                    <TableCell>{password.created}</TableCell>
                    <TableCell>{password.lastUsed}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteAppPassword(password.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Notificações de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Notificações de Segurança
          </CardTitle>
          <CardDescription>
            Configure alertas para atividades de segurança
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações de Login</Label>
              <p className="text-sm text-muted-foreground">
                Receber e-mail quando houver login na conta
              </p>
            </div>
            <Switch
              checked={loginNotifications}
              onCheckedChange={setLoginNotifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Atividade Suspeita</Label>
              <p className="text-sm text-muted-foreground">
                Alertas para tentativas de acesso incomuns
              </p>
            </div>
            <Switch
              checked={suspiciousActivity}
              onCheckedChange={setSuspiciousActivity}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sessões Ativas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Sessões Ativas
          </CardTitle>
          <CardDescription>
            Gerencie dispositivos conectados à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Última Atividade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{session.device}</div>
                      <div className="text-xs text-muted-foreground">{session.browser}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="text-sm">{session.location}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{session.ip}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-sm">{session.lastActivity}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {session.isCurrent ? (
                      <Badge className="bg-green-100 text-green-800">Atual</Badge>
                    ) : (
                      <Badge variant="secondary">Ativa</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!session.isCurrent && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                      >
                        <LogOut className="h-3 w-3 mr-1" />
                        Revogar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Log de Atividades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Log de Atividades
          </CardTitle>
          <CardDescription>
            Histórico de atividades de segurança da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ação</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell>
                    <div>{log.location}</div>
                    <div className="text-xs text-muted-foreground">{log.ip}</div>
                  </TableCell>
                  <TableCell>
                    {log.success ? (
                      <Badge className="bg-green-100 text-green-800">Sucesso</Badge>
                    ) : (
                      <Badge variant="destructive">Falha</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}