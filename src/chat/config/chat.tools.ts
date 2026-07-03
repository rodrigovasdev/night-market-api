export const CHAT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_available_products',
      description:
        'Obtiene la lista de productos disponibles en el catálogo de Night Market. ' +
        'Úsala SOLO cuando el usuario explícitamente pregunte qué productos hay, qué venden, el catálogo o productos disponibles. ' +
        'NO la uses para saludos, agradecimientos ni preguntas generales sobre el asistente.',
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_product_by_name',
      description:
        'Busca productos en el catálogo por términos relacionados. Úsala cuando el usuario pregunte por un producto específico. Debes incluir sinónimos y variantes: singular, plural, palabras relacionadas.',
      parameters: {
        type: 'object',
        properties: {
          terms: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Lista de términos de búsqueda: incluye la palabra original, variantes en singular/plural y sinónimos relacionados, sin tildes.',
          },
        },
        required: ['terms'],
      },
    },
  },
] as const;
