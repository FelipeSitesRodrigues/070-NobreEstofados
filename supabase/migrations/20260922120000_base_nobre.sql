-- ============================================================================
-- Nobre Estofados · banco da loja e do painel
--
-- Princípios (os mesmos da 065 Harmonia):
-- 1. Tudo fechado por padrão. Toda tabela tem RLS ligado, as permissões de
--    anon e authenticated são revogadas e devolvidas só no que cada um usa.
-- 2. Painel com e-mail e senha. Quem é administrador decide public.eh_admin().
-- 3. Visitante lê só produto ativo, com as variações e as mídias dele.
-- 4. Funções security definer com search_path vazio e nomes qualificados.
-- 5. Fotos e vídeos sobem do navegador direto para o Storage, por link
--    assinado que o servidor gera depois de conferir a sessão. O bucket não
--    tem nenhuma política de escrita.
-- 6. Compra é pelo WhatsApp: não existe pedido, pagamento nem estoque aqui.
--    "interesses" só conta quantas vezes cada modelo foi pedido.
-- ============================================================================

create extension if not exists unaccent with schema extensions;

-- ----------------------------------------------------------------------------
-- Utilitários
-- ----------------------------------------------------------------------------

create or replace function public.definir_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

/* "Sofá Porto Príncipe" vira "sofa-porto-principe". */
create or replace function public.slug_de(p_texto text)
returns text
language sql
stable
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(lower(extensions.unaccent(coalesce(p_texto, ''))), '[^a-z0-9]+', '-', 'g'));
$$;

/* Slug que ainda não existe: "sofa-veneza", "sofa-veneza-2", "sofa-veneza-3"... */
create or replace function public.slug_livre(p_base text)
returns text
language plpgsql
stable
set search_path = ''
as $$
declare
  v_base text := left(coalesce(nullif(p_base, ''), 'produto'), 70);
  v_slug text := v_base;
  v_n integer := 1;
begin
  while exists (select 1 from public.produtos where slug = v_slug) loop
    v_n := v_n + 1;
    v_slug := v_base || '-' || v_n;
  end loop;
  return v_slug;
end;
$$;

-- ----------------------------------------------------------------------------
-- Perfis e acesso
-- ----------------------------------------------------------------------------

create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 120),
  papel text not null default 'admin' check (papel in ('admin')),
  criado_em timestamptz not null default now()
);

alter table public.perfis enable row level security;
revoke all on table public.perfis from anon, authenticated;
grant select on table public.perfis to authenticated;

create policy "cada um lê o próprio perfil"
  on public.perfis for select to authenticated
  using (id = (select auth.uid()));

/* Administrador: tem perfil admin. O cadastro no Auth fica fechado; só entra quem foi convidado. */
create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfis p
    where p.id = (select auth.uid()) and p.papel = 'admin'
  );
$$;

revoke all on function public.eh_admin() from public, anon;
grant execute on function public.eh_admin() to authenticated;

-- ----------------------------------------------------------------------------
-- Categorias
-- ----------------------------------------------------------------------------

create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (char_length(slug) between 2 and 60 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nome text not null check (char_length(nome) between 2 and 60),
  descricao text not null default '' check (char_length(descricao) <= 300),
  ordem integer not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create trigger categorias_atualizado_em
  before update on public.categorias
  for each row execute function public.definir_atualizado_em();

-- ----------------------------------------------------------------------------
-- Produtos
-- ----------------------------------------------------------------------------

create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  -- Gerado do nome na criação e fixo depois: é o endereço da página no Google
  slug text not null unique
    check (char_length(slug) between 2 and 80 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nome text not null check (char_length(nome) between 2 and 120),
  categoria_id uuid not null references public.categorias (id) on delete restrict,
  subtitulo text not null default '' check (char_length(subtitulo) <= 80),
  descricao text not null default '' check (char_length(descricao) <= 2000),
  -- Centímetros: altura, comprimento, comprimentoLado, profundidade,
  -- profundidadeAberto, profundidadeChaise e, nos conjuntos, pecas
  -- [{ nome, comprimento }]. O site valida o formato ao ler e ao gravar.
  medidas jsonb not null default '{}'::jsonb check (jsonb_typeof(medidas) = 'object'),
  disponibilidade text not null default 'disponivel'
    check (disponibilidade in ('disponivel', 'pronta-entrega', 'sob-encomenda', 'indisponivel')),
  prazo_dias smallint check (prazo_dias between 1 and 365),
  -- Posição fixa nos "Sofás mais procurados" da home (1 a 6)
  fixado smallint check (fixado between 1 and 6),
  status text not null default 'rascunho' check (status in ('rascunho', 'ativo', 'arquivado')),
  ordem integer not null default 0,
  meta_titulo text check (char_length(meta_titulo) <= 70),
  meta_descricao text check (char_length(meta_descricao) <= 170),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint produtos_prazo_so_encomenda check (prazo_dias is null or disponibilidade = 'sob-encomenda'),
  -- Adiável: trocar dois fixados de posição numa transação só
  constraint produtos_fixado_unico unique (fixado) deferrable initially deferred
);

create index produtos_vitrine_idx on public.produtos (status, categoria_id, ordem);

create trigger produtos_atualizado_em
  before update on public.produtos
  for each row execute function public.definir_atualizado_em();

-- ----------------------------------------------------------------------------
-- Variações: onde mora o preço. Todo produto tem ao menos uma.
-- ----------------------------------------------------------------------------

create table public.variacoes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos (id) on delete cascade,
  -- null no produto de uma opção só
  nome text check (nome is null or char_length(nome) between 1 and 80),
  -- null = "Consulte o valor no WhatsApp"
  preco_centavos integer check (preco_centavos between 0 and 100000000),
  -- Preço cheio de uma promoção ("de R$ 3.990 por R$ 3.490")
  preco_cheio_centavos integer check (preco_cheio_centavos between 0 and 100000000),
  ordem smallint not null default 0,
  criado_em timestamptz not null default now(),
  constraint variacoes_promocao
    check (preco_cheio_centavos is null or (preco_centavos is not null and preco_cheio_centavos > preco_centavos))
);

create index variacoes_produto_idx on public.variacoes (produto_id, ordem);

-- ----------------------------------------------------------------------------
-- Mídias: fotos e o vídeo de cada produto
-- ----------------------------------------------------------------------------

create table public.midias (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos (id) on delete cascade,
  tipo text not null check (tipo in ('foto', 'video')),
  /*
   * Os arquivos no bucket "midias" saem dos ids, nenhum caminho é gravado:
   *   foto:  <produto>/<midia>-<largura>.webp, uma por largura de "larguras"
   *   vídeo: <produto>/<midia>.mp4, e a capa em <produto>/<midia>-<largura>.webp
   * largura e altura são as da maior versão (a capa, no vídeo).
   */
  larguras smallint[] not null check (cardinality(larguras) between 1 and 4),
  largura integer not null check (largura between 1 and 10000),
  altura integer not null check (altura between 1 and 10000),
  blur text check (char_length(blur) <= 4000 and blur like 'data:image/%'),
  alt text not null default '' check (char_length(alt) <= 200),
  -- Ponto que precisa aparecer quando o card recorta a foto
  foco_x smallint not null default 50 check (foco_x between 0 and 100),
  foco_y smallint not null default 50 check (foco_y between 0 and 100),
  duracao_segundos smallint check (duracao_segundos between 1 and 600),
  ordem smallint not null default 0,
  criado_em timestamptz not null default now(),
  constraint midias_duracao_so_video check (tipo = 'video' or duracao_segundos is null)
);

create index midias_produto_idx on public.midias (produto_id, ordem);

/* Um vídeo por produto: é o combinado com a Edna ("um vídeo de cada sofá"). */
create unique index midias_um_video_idx on public.midias (produto_id) where tipo = 'video';

-- ----------------------------------------------------------------------------
-- Configurações da loja (linha única)
-- ----------------------------------------------------------------------------

create table public.configuracoes (
  id boolean primary key default true check (id),
  -- Só dígitos, com DDI: 5511900000000
  whatsapp text not null default '' check (whatsapp ~ '^[0-9]{0,13}$'),
  instagram text not null default '' check (instagram = '' or instagram ~ '^https://(www\.)?instagram\.com/'),
  -- Frase do topo do site ("Entregamos em Irecê e região"). Vazio esconde.
  texto_entrega text not null default '' check (char_length(texto_entrega) <= 80),
  -- Parcelas sem juros no cartão ("em até 12x"). null esconde a linha.
  parcelas smallint check (parcelas between 2 and 24),
  aviso_texto text not null default '' check (char_length(aviso_texto) <= 140),
  aviso_ativo boolean not null default false,
  atualizado_em timestamptz not null default now()
);

create trigger configuracoes_atualizado_em
  before update on public.configuracoes
  for each row execute function public.definir_atualizado_em();

-- TODO(cliente): WhatsApp de exemplo. A Edna troca pelo dela no painel.
insert into public.configuracoes (id, whatsapp) values (true, '5511900000000')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Interesses: cada toque num botão de compra ou pergunta no WhatsApp
-- ----------------------------------------------------------------------------

create table public.interesses (
  id bigint generated always as identity primary key,
  produto_id uuid not null references public.produtos (id) on delete cascade,
  variacao_id uuid references public.variacoes (id) on delete set null,
  origem text not null check (origem in ('produto', 'card', 'carrinho')),
  criado_em timestamptz not null default now()
);

create index interesses_produto_data_idx on public.interesses (produto_id, criado_em desc);
create index interesses_data_idx on public.interesses (criado_em desc);

/*
 * Grava os toques de um clique (um produto, ou todos os itens do carrinho).
 * Só o servidor chama, depois do limite por IP. Id que não existe, que não
 * tem cara de uuid ou de produto fora do ar é ignorado sem erro.
 */
create or replace function public.registrar_interesse(p_itens jsonb, p_origem text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_gravados integer;
begin
  if p_origem not in ('produto', 'card', 'carrinho') then
    raise exception 'origem_invalida';
  end if;
  if jsonb_typeof(p_itens) <> 'array' or jsonb_array_length(p_itens) > 20 then
    raise exception 'itens_invalidos';
  end if;

  with brutos as (
    select e ->> 'produto_id' as produto, e ->> 'variacao_id' as variacao
      from jsonb_array_elements(p_itens) e
  ),
  ids as (
    select case when produto ~ '^[0-9a-f-]{36}$' then produto::uuid end as produto_id,
           case when variacao ~ '^[0-9a-f-]{36}$' then variacao::uuid end as variacao_id
      from brutos
  )
  insert into public.interesses (produto_id, variacao_id, origem)
  select p.id, v.id, p_origem
    from ids
    join public.produtos p on p.id = ids.produto_id and p.status = 'ativo'
    left join public.variacoes v on v.id = ids.variacao_id and v.produto_id = p.id;

  get diagnostics v_gravados = row_count;
  return v_gravados;
end;
$$;

revoke all on function public.registrar_interesse(jsonb, text) from public, anon, authenticated;
grant execute on function public.registrar_interesse(jsonb, text) to service_role;

/*
 * Mais pedidos no WhatsApp nos últimos p_dias, só de produto ativo. É só
 * contagem, sem nada de quem pediu, então a loja pode ler.
 */
create or replace function public.ranking_procura(p_dias integer default 30)
returns table (produto_id uuid, pedidos bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select i.produto_id, count(*) as pedidos
    from public.interesses i
    join public.produtos p on p.id = i.produto_id and p.status = 'ativo'
   where i.criado_em >= now() - make_interval(days => least(greatest(coalesce(p_dias, 30), 1), 365))
   group by i.produto_id
   order by pedidos desc, i.produto_id
   limit 50;
$$;

revoke all on function public.ranking_procura(integer) from public;
grant execute on function public.ranking_procura(integer) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Painel: salvar produto e variações numa transação só
-- ----------------------------------------------------------------------------

/*
 * p_id null cria o produto (o slug sai do nome); com id, altera.
 * p_dados: { nome, categoria_id, subtitulo, descricao, medidas, disponibilidade,
 *            prazo_dias, fixado, status, ordem, meta_titulo, meta_descricao,
 *            variacoes: [{ id?, nome, preco_centavos, preco_cheio_centavos }] }
 * O servidor valida o formato antes (zod); aqui ficam as travas do banco. Roda
 * com a sessão de quem chamou, então as políticas de admin valem.
 */
create or replace function public.salvar_produto(p_id uuid, p_dados jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid := p_id;
  v_fixado smallint := nullif(p_dados ->> 'fixado', '')::smallint;
  v_variacoes jsonb := coalesce(p_dados -> 'variacoes', '[]'::jsonb);
  v_item jsonb;
  v_nova uuid;
  v_ordem smallint := 0;
  v_mantidas uuid[] := '{}';
begin
  if not public.eh_admin() then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if jsonb_typeof(v_variacoes) <> 'array' or jsonb_array_length(v_variacoes) not between 1 and 12 then
    raise exception 'variacoes_invalidas';
  end if;

  -- Quem estava na posição que este produto vai ocupar sai dela
  if v_fixado is not null then
    update public.produtos set fixado = null where fixado = v_fixado and id is distinct from v_id;
  end if;

  if v_id is null then
    insert into public.produtos (
      slug, nome, categoria_id, subtitulo, descricao, medidas, disponibilidade, prazo_dias,
      fixado, status, ordem, meta_titulo, meta_descricao
    ) values (
      public.slug_livre(public.slug_de(p_dados ->> 'nome')),
      p_dados ->> 'nome',
      (p_dados ->> 'categoria_id')::uuid,
      coalesce(p_dados ->> 'subtitulo', ''),
      coalesce(p_dados ->> 'descricao', ''),
      coalesce(p_dados -> 'medidas', '{}'::jsonb),
      coalesce(p_dados ->> 'disponibilidade', 'disponivel'),
      nullif(p_dados ->> 'prazo_dias', '')::smallint,
      v_fixado,
      coalesce(p_dados ->> 'status', 'rascunho'),
      coalesce(nullif(p_dados ->> 'ordem', '')::integer, 0),
      nullif(p_dados ->> 'meta_titulo', ''),
      nullif(p_dados ->> 'meta_descricao', '')
    )
    returning id into v_id;
  else
    update public.produtos set
      nome = p_dados ->> 'nome',
      categoria_id = (p_dados ->> 'categoria_id')::uuid,
      subtitulo = coalesce(p_dados ->> 'subtitulo', ''),
      descricao = coalesce(p_dados ->> 'descricao', ''),
      medidas = coalesce(p_dados -> 'medidas', '{}'::jsonb),
      disponibilidade = coalesce(p_dados ->> 'disponibilidade', 'disponivel'),
      prazo_dias = nullif(p_dados ->> 'prazo_dias', '')::smallint,
      fixado = v_fixado,
      status = coalesce(p_dados ->> 'status', status),
      ordem = coalesce(nullif(p_dados ->> 'ordem', '')::integer, ordem),
      meta_titulo = nullif(p_dados ->> 'meta_titulo', ''),
      meta_descricao = nullif(p_dados ->> 'meta_descricao', '')
    where id = v_id;
    if not found then
      raise exception 'produto_inexistente';
    end if;
  end if;

  -- Variações: altera as que vieram com id, cria as novas e apaga as que saíram
  for v_item in select * from jsonb_array_elements(v_variacoes) loop
    if v_item ->> 'id' is not null then
      update public.variacoes set
        nome = nullif(v_item ->> 'nome', ''),
        preco_centavos = nullif(v_item ->> 'preco_centavos', '')::integer,
        preco_cheio_centavos = nullif(v_item ->> 'preco_cheio_centavos', '')::integer,
        ordem = v_ordem
      where id = (v_item ->> 'id')::uuid and produto_id = v_id;
      if not found then
        raise exception 'variacao_inexistente';
      end if;
      v_mantidas := v_mantidas || (v_item ->> 'id')::uuid;
    else
      insert into public.variacoes (produto_id, nome, preco_centavos, preco_cheio_centavos, ordem)
      values (
        v_id,
        nullif(v_item ->> 'nome', ''),
        nullif(v_item ->> 'preco_centavos', '')::integer,
        nullif(v_item ->> 'preco_cheio_centavos', '')::integer,
        v_ordem
      )
      returning id into v_nova;
      v_mantidas := v_mantidas || v_nova;
    end if;
    v_ordem := v_ordem + 1;
  end loop;

  delete from public.variacoes where produto_id = v_id and not (id = any (v_mantidas));

  return v_id;
end;
$$;

revoke all on function public.salvar_produto(uuid, jsonb) from public, anon;
grant execute on function public.salvar_produto(uuid, jsonb) to authenticated;

-- ----------------------------------------------------------------------------
-- Limite de tentativas (login do painel, registro de interesse)
-- ----------------------------------------------------------------------------

create table public.limites (
  chave text primary key check (char_length(chave) <= 200),
  contagem integer not null,
  janela_inicio timestamptz not null
);

alter table public.limites enable row level security;
revoke all on table public.limites from anon, authenticated;

/* true = pode seguir; false = passou do limite na janela. */
create or replace function public.consumir_limite(p_chave text, p_maximo integer, p_janela_segundos integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_agora timestamptz := now();
  v_contagem integer;
begin
  insert into public.limites as l (chave, contagem, janela_inicio)
  values (left(p_chave, 200), 1, v_agora)
  on conflict (chave) do update
     set contagem = case when l.janela_inicio < v_agora - make_interval(secs => p_janela_segundos) then 1 else l.contagem + 1 end,
         janela_inicio = case when l.janela_inicio < v_agora - make_interval(secs => p_janela_segundos) then v_agora else l.janela_inicio end
  returning contagem into v_contagem;

  if random() < 0.02 then
    delete from public.limites where janela_inicio < v_agora - interval '1 day';
  end if;

  return v_contagem <= p_maximo;
end;
$$;

revoke all on function public.consumir_limite(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consumir_limite(text, integer, integer) to service_role;

-- ----------------------------------------------------------------------------
-- Permissões
-- ----------------------------------------------------------------------------

alter table public.categorias enable row level security;
alter table public.produtos enable row level security;
alter table public.variacoes enable row level security;
alter table public.midias enable row level security;
alter table public.configuracoes enable row level security;
alter table public.interesses enable row level security;

revoke all on table public.categorias, public.produtos, public.variacoes, public.midias,
  public.configuracoes, public.interesses from anon, authenticated;

-- Loja: leitura
grant select on table public.categorias, public.produtos, public.variacoes, public.midias,
  public.configuracoes to anon;

-- Painel: leitura e escrita, sempre com as políticas de admin abaixo
grant select, insert, update, delete on table public.categorias, public.produtos, public.variacoes,
  public.midias to authenticated;
grant select, update on table public.configuracoes to authenticated;
grant select on table public.interesses to authenticated;

create policy "todos leem as categorias"
  on public.categorias for select to anon, authenticated
  using (true);

create policy "admin gerencia categorias"
  on public.categorias for all to authenticated
  using ((select public.eh_admin()))
  with check ((select public.eh_admin()));

create policy "loja vê produtos ativos"
  on public.produtos for select to anon, authenticated
  using (status = 'ativo');

create policy "admin gerencia produtos"
  on public.produtos for all to authenticated
  using ((select public.eh_admin()))
  with check ((select public.eh_admin()));

create policy "loja vê variações de produto ativo"
  on public.variacoes for select to anon, authenticated
  using (exists (select 1 from public.produtos p where p.id = produto_id and p.status = 'ativo'));

create policy "admin gerencia variações"
  on public.variacoes for all to authenticated
  using ((select public.eh_admin()))
  with check ((select public.eh_admin()));

create policy "loja vê mídias de produto ativo"
  on public.midias for select to anon, authenticated
  using (exists (select 1 from public.produtos p where p.id = produto_id and p.status = 'ativo'));

create policy "admin gerencia mídias"
  on public.midias for all to authenticated
  using ((select public.eh_admin()))
  with check ((select public.eh_admin()));

create policy "todos leem as configurações"
  on public.configuracoes for select to anon, authenticated
  using (true);

create policy "admin altera configurações"
  on public.configuracoes for update to authenticated
  using ((select public.eh_admin()))
  with check ((select public.eh_admin()));

create policy "admin lê os interesses"
  on public.interesses for select to authenticated
  using ((select public.eh_admin()));

-- ----------------------------------------------------------------------------
-- Storage: fotos e vídeos dos produtos
-- ----------------------------------------------------------------------------

-- Público pra leitura pela URL. 50 MB é o teto de arquivo do plano grátis;
-- o painel comprime o vídeo antes de subir, então fica bem abaixo disso.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('midias', 'midias', true, 52428800, array['image/webp', 'video/mp4'])
on conflict (id) do nothing;
