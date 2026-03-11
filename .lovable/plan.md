

## Plano: Criar utilizador administrador inicial

### Problema
O banco de dados está limpo -- não há utilizadores em `auth.users` nem em `user_roles`. Os logins falham com "Invalid login credentials". A Edge Function `manage-users` exige um caller autenticado com role ADMIN/DIRETORIA/SECRETARIA, criando um problema de "ovo e galinha".

### Solução
Criar uma Edge Function temporária `bootstrap-admin` que:
1. Verifica se já existem utilizadores na tabela `user_roles` (se sim, bloqueia -- só funciona uma vez)
2. Cria um utilizador admin via `supabase.auth.admin.createUser()`
3. Insere o role ADMIN na tabela `user_roles`
4. Insere o perfil na tabela `profiles`

### Implementação

**1. Criar Edge Function `supabase/functions/bootstrap-admin/index.ts`**
- Aceita `email`, `password`, `full_name` no body
- Usa `SUPABASE_SERVICE_ROLE_KEY` para criar o utilizador
- Verifica que `user_roles` está vazio (segurança: só permite bootstrap se não houver admins)
- Cria utilizador em `auth.users`, insere role ADMIN em `user_roles`, e perfil em `profiles`
- Retorna sucesso com os dados do utilizador criado

**2. Após deploy, o utilizador chama a função uma vez** para criar a conta admin (ex: admin@escolareviva.com)

**3. Depois do bootstrap, a função se auto-bloqueia** pois `user_roles` já terá registos

### Dados do admin sugerido
- Email: admin@escolareviva.com
- Nome: Administrador SIGER
- Password: definida pelo utilizador

### Segurança
- A função só executa se `user_roles` estiver completamente vazia
- Usa `service_role_key` (server-side only, nunca exposta ao cliente)
- Após o primeiro admin ser criado, novos utilizadores são geridos pela UI via `manage-users`

