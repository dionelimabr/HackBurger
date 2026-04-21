import { Component } from '@angular/core';

export interface DocNav {
  section: string;
  items: { slug: string; title: string }[];
}

@Component({
  selector: 'app-docs-layout',
  templateUrl: './docs-layout.component.html',
  styleUrls: ['./docs-layout.component.scss'],
})
export class DocsLayoutComponent {
  sidebarOpen = false;

  nav: DocNav[] = [
    {
      section: 'Começando',
      items: [
        { slug: 'index', title: 'Visão Geral' },
        { slug: 'setup-guide', title: 'Guia de Setup' },
      ],
    },
    {
      section: 'Arquitetura',
      items: [
        { slug: 'architecture', title: 'Arquitetura' },
        { slug: 'database', title: 'Banco de Dados' },
      ],
    },
    {
      section: 'Referência',
      items: [
        { slug: 'api-reference', title: 'API REST' },
      ],
    },
    {
      section: 'Operação',
      items: [
        { slug: 'deployment', title: 'Deployment' },
        { slug: 'monitoring', title: 'Monitoramento' },
        { slug: 'testing', title: 'Testes' },
      ],
    },
    {
      section: 'Contribuição',
      items: [
        { slug: 'contributing', title: 'Como Contribuir' },
      ],
    },
  ];

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar() { this.sidebarOpen = false; }
}
