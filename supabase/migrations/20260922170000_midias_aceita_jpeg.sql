-- ----------------------------------------------------------------------------
-- O bucket de mídias passa a aceitar JPEG, além de WebP e MP4
-- ----------------------------------------------------------------------------
--
-- O painel prepara a foto no próprio navegador (canvas) antes de subir, porque
-- o arquivo vai direto pro Storage, sem passar pelo servidor. O Safari do
-- iPhone aceita canvas.toBlob('image/webp') e devolve outro formato: nesses
-- aparelhos a foto sai em JPEG, e o bucket precisa aceitar.
--
-- O nome do arquivo continua terminando em .webp (o caminho sai dos ids, como
-- a tabela midias documenta). Isso não atrapalha: o navegador escolhe como
-- desenhar pelo content-type que o Storage devolve, não pela terminação.

update storage.buckets
   set allowed_mime_types = array['image/webp', 'image/jpeg', 'video/mp4']
 where id = 'midias';
