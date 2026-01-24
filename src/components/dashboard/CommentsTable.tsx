import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search, MessageSquare } from 'lucide-react';

interface Comment {
  id: string;
  fecha: string;
  turno: string;
  comentario: string;
}

interface CommentsTableProps {
  comments: Comment[];
  pageSize?: number;
}

export function CommentsTable({ comments, pageSize = 10 }: CommentsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredComments = comments.filter(
    (c) =>
      c.comentario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fecha.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredComments.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedComments = filteredComments.slice(startIndex, startIndex + pageSize);

  const turnoLabels: Record<string, string> = {
    madrugada: '12am - 6am',
    manana: '6am - 12pm',
    tarde: '12pm - 6pm',
    noche: '6pm - 12am',
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <MessageSquare className="h-5 w-5" />
            Comentarios de Pacientes
          </CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar comentarios..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {paginatedComments.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              No se encontraron comentarios
            </div>
          ) : (
            paginatedComments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-lg border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary">
                    {comment.fecha}
                  </span>
                  <span className="rounded bg-secondary/20 px-2 py-0.5">
                    {turnoLabels[comment.turno] || comment.turno}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{comment.comentario}</p>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1}-{Math.min(startIndex + pageSize, filteredComments.length)} de{' '}
              {filteredComments.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
