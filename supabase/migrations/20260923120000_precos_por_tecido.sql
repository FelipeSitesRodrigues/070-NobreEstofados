-- ----------------------------------------------------------------------------
-- Preço por tecido em cada tamanho
-- ----------------------------------------------------------------------------
--
-- A tabela da fábrica (R7) dá três preços por tamanho, um por linha de tecido:
-- Veludo (100), Linho (300) e Premium (500). A cor dentro da linha não muda o
-- preço, então a variação (o tamanho) guarda só os três valores:
--
--   precos_tecido = { "veludo": 200600, "linho": 211300, "premium": 216200 }
--
-- preco_centavos continua existindo e é sempre o do Veludo, o mais barato: é o
-- "a partir de" do card, e produto sem tabela por tecido (o Conjunto Roma)
-- segue funcionando só com ele. salvar_produto garante que os dois batem.
--
-- As cores (Veludo 102, Linho 304...) não moram no banco: são as páginas do
-- mostruário, fixas, em src/lib/catalogo/tecidos.json.

create or replace function public.precos_tecido_validos(p jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p is null or (
    jsonb_typeof(p) = 'object'
    and not exists (
      select 1
        from jsonb_each(p) e
       where e.key not in ('veludo', 'linho', 'premium')
          or jsonb_typeof(e.value) <> 'number'
          or (e.value)::numeric not between 0 and 100000000
          or (e.value)::numeric <> trunc((e.value)::numeric)
    )
  );
$$;

alter table public.variacoes
  add column precos_tecido jsonb
  constraint variacoes_precos_tecido check (public.precos_tecido_validos(precos_tecido));

-- ----------------------------------------------------------------------------
-- salvar_produto passa a gravar precos_tecido
-- ----------------------------------------------------------------------------
--
-- Igual à versão da migração base, com duas mudanças nas variações:
--   1. quando vem precos_tecido, o preco_centavos é o Veludo dele (o formulário
--      não precisa mandar os dois, e eles nunca ficam diferentes);
--   2. o teto sobe de 12 pra 30 tamanhos: o Veneza já tem 12 na tabela, e os
--      sofás com duas versões de pillow somam as duas.

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
  v_precos jsonb;
  v_preco integer;
  v_nova uuid;
  v_ordem smallint := 0;
  v_mantidas uuid[] := '{}';
begin
  if not public.eh_admin() then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if jsonb_typeof(v_variacoes) <> 'array' or jsonb_array_length(v_variacoes) not between 1 and 30 then
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
    v_precos := case
      when jsonb_typeof(v_item -> 'precos_tecido') = 'object' and v_item -> 'precos_tecido' <> '{}'::jsonb
        then v_item -> 'precos_tecido'
    end;
    v_preco := coalesce((v_precos ->> 'veludo')::integer, nullif(v_item ->> 'preco_centavos', '')::integer);

    if v_item ->> 'id' is not null then
      update public.variacoes set
        nome = nullif(v_item ->> 'nome', ''),
        preco_centavos = v_preco,
        preco_cheio_centavos = nullif(v_item ->> 'preco_cheio_centavos', '')::integer,
        precos_tecido = v_precos,
        ordem = v_ordem
      where id = (v_item ->> 'id')::uuid and produto_id = v_id;
      if not found then
        raise exception 'variacao_inexistente';
      end if;
      v_mantidas := v_mantidas || (v_item ->> 'id')::uuid;
    else
      insert into public.variacoes (produto_id, nome, preco_centavos, preco_cheio_centavos, precos_tecido, ordem)
      values (
        v_id,
        nullif(v_item ->> 'nome', ''),
        v_preco,
        nullif(v_item ->> 'preco_cheio_centavos', '')::integer,
        v_precos,
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
