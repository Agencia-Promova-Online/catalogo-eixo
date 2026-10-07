-- 1) Normaliza categorias nas máquinas (sem excluir registros, sem tocar valores)
UPDATE public.machines
SET category = 'PÁ CARREGADEIRA'
WHERE upper(btrim(category)) IN ('PÁ CARREGADEIRAS', 'PA CARREGADEIRAS', 'PA CARREGADEIRA', 'PÁ  CARREGADEIRA');

UPDATE public.machines
SET category = 'ESCAVADEIRA'
WHERE upper(btrim(category)) IN ('ESCAVADEIRAS');

UPDATE public.machines SET category = upper(btrim(category)) WHERE category <> upper(btrim(category));

-- 2) Normaliza a tabela de categorias e remove duplicatas plurais
UPDATE public.categories
SET name = 'PÁ CARREGADEIRA'
WHERE upper(btrim(name)) IN ('PÁ CARREGADEIRAS', 'PA CARREGADEIRAS', 'PA CARREGADEIRA');

UPDATE public.categories
SET name = 'ESCAVADEIRA'
WHERE upper(btrim(name)) IN ('ESCAVADEIRAS');

UPDATE public.categories SET name = upper(btrim(name)) WHERE name <> upper(btrim(name));

DELETE FROM public.categories c
USING public.categories keep
WHERE c.name = keep.name
  AND c.ctid > keep.ctid;

-- 3) Remove categorias auxiliares indesejadas que não têm máquinas
DELETE FROM public.categories c
WHERE regexp_replace(upper(c.name), '\s', '', 'g') IN ('4X4', '4POR4')
  AND NOT EXISTS (SELECT 1 FROM public.machines m WHERE m.category = c.name);