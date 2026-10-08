/**
 * src/__static-shims__users-server-types.ts
 *
 * Mantemos o tipo AuthContext aqui para não ter dependência cíclica.
 */

export type AuthContext = {
  supabase: {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (
          column: string,
          value: unknown,
        ) => {
          eq: (
            column: string,
            value: unknown,
          ) => { maybeSingle: () => Promise<{ data: unknown; error: unknown }> };
        };
      };
    };
  };
  userId: string;
};
