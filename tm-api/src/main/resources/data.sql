INSERT INTO TASKS (id, title, description, status, priority, due_date, created_at, updated_at, deleted) VALUES 
(RANDOM_UUID(), 'Configurar Spring Boot', 'Configuração inicial do projeto com dependências necessárias.', 'DONE', 'HIGH', DATEADD('DAY', 1, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(RANDOM_UUID(), 'Desenhar Telas no Figma', 'Criar protótipos de alta fidelidade para o Kanban.', 'DONE', 'MEDIUM', DATEADD('DAY', 2, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(RANDOM_UUID(), 'Implementar Drag & Drop', 'Utilizar dnd-kit para permitir movimentação entre colunas.', 'DOING', 'HIGH', DATEADD('DAY', 3, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(RANDOM_UUID(), 'Escrever Testes Unitários', 'Garantir cobertura da camada de service com JUnit e Mockito.', 'TODO', 'HIGH', DATEADD('DAY', 5, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(RANDOM_UUID(), 'Documentar com Swagger', 'Configurar o SpringDoc para gerar a documentação automática.', 'TODO', 'LOW', DATEADD('DAY', 7, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false);
