## Esquema de base de datos

Se definieron dos tablas relacionadas en Drizzle ORM: `profiles` (usuarios) 
y `posts` (publicaciones), con una relación 1-a-muchos mediante foreign key 
(`posts.author_id` → `profiles.id`, `ON DELETE CASCADE`).

### Evidencia en Supabase

![Tablas en Supabase](./assets/Supabase%20posts%20profiles.JPG)

## Verificación de la relación (Foreign Key + Cascade)

Además de validar el esquema en Supabase, se corrió un script de prueba 
(`src/db/test-cascade.ts`) para confirmar en la práctica que el `ON DELETE CASCADE` 
funciona correctamente:

1. Se crea un `profile` de prueba.
2. Se crea un `post` asociado a ese `profile` (vía `authorId`).
3. Se confirma que el `post` existe.
4. Se borra el `profile`.
5. Se confirma que el `post` fue eliminado automáticamente por Postgres, 
   sin necesidad de borrarlo manualmente desde el código.

### Resultado del test

✅ Profile creado: { id: '...', username: 'test-cascade-user', createdAt: ... }
✅ Post creado: { id: 1, title: 'Post de prueba', ... }
📋 Posts antes del delete: 1
🗑️  Profile borrado
📋 Posts después del delete: 0
✅ CASCADE funcionó correctamente


Para correr el test:

~~~bash
npx tsx tests/test-cascade.ts
~~~

## API tRPC — Validación con Zod

Se implementaron dos routers de dominio (`user` y `post`), con procedimientos
de lectura (query) y escritura (mutation), validados con Zod:

- `user.getUsers` — trae todos los perfiles.
- `user.createUser` — crea un perfil (valida `username` no vacío).
- `post.getPosts` — trae posts, con filtros opcionales por `authorId` y `published`.
- `post.createPost` — crea un post (valida `title` de 5-100 caracteres, `authorId` como UUID válido).

### Probar los endpoints

Con `npm run dev` corriendo:

- GET `http://localhost:3000/api/trpc/post.getPosts`
- POST `http://localhost:3000/api/trpc/post.createPost` con body:
  \`\`\`json
  { "title": "Mi post", "authorId": "<uuid-de-un-profile>" }
  \`\`\`

Un `title` de menos de 5 caracteres devuelve `400 BAD_REQUEST` con el detalle
del error de validación de Zod.