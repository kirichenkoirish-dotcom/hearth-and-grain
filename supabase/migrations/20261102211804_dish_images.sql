-- Фото блюд из макета лежат в папке сайта public/images/dishes/<slug>.jpg.
-- Фото, которые админ загрузит позже, будут храниться в Supabase Storage (dish-photos).
update public.dishes
set image_url = '/images/dishes/' || slug || '.jpg'
where image_url is null;
