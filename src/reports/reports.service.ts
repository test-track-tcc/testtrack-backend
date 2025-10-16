import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { TestCase } from 'src/test-case/entities/test-case.entity';
import { TestCaseStatus } from 'src/config/enums';
import { Project } from 'src/projects/entities/project.entity';
import PDFDocument = require('pdfkit');
import * as fs from 'fs';
import * as path from 'path';
import { ChartService } from 'src/chart/chart.service';
import { PdfGeneratorService } from 'src/pdf-generator/pdf-generator.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(TestCase)
    private readonly testCaseRepository: Repository<TestCase>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly chartService: ChartService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  /**
   * Orquestrador principal que gera um relatório para cada projeto com atividade na semana.
   */
  async generateWeeklyReport(): Promise<void> {
    this.logger.log('Iniciando a geração de relatórios semanais por projeto...');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    // Encontra todos os projetos com atividade na última semana
    const activeProjects = await this.findProjects();

    if (activeProjects.length === 0) {
      this.logger.log('Nenhum projeto com atividade na última semana. Nenhum relatório gerado.');
      return;
    }

    this.logger.log(`Encontrados ${activeProjects.length} projetos ativos para gerar relatórios.`);

    // Itera sobre cada projeto ativo e gerar um relatório individual
    for (const project of activeProjects) {
      await this.generateReportForProject(project, startDate, endDate);
    }
  }

  /**
   * Conta quantos casos de teste existem para cada status dentro de um período específico.
   */
  private async countTestCasesByStatus(projectId: string, startDate: Date, endDate: Date): Promise<Map<string, number>> {

    // A partir do enum TestCaseStatus, contamos quantos casos de teste existem para cada status
    // dentro da última semana (no futuro podemos fazer com períodos mais flexíveis).
    const allStatuses = Object.values(TestCaseStatus);
    const statuses = new Map<string, number>();

    const countPromises = allStatuses.map(status => 
        this.testCaseRepository.count({
            where: {
                project: { id: projectId },
                status: status,
                updatedAt: Between(startDate, endDate),
            },
        })
    );

    const counts = await Promise.all(countPromises);

    allStatuses.forEach((status, index) => {
        statuses.set(status, counts[index]);
    });

    return statuses;
  }

  private async createFilePath(fileName: string): Promise<string> {
    const testtrackdir = process.cwd();
    this.logger.log(`Diretório atual do processo: ${testtrackdir}`);
    const consecutiveDirs = [testtrackdir, 'private', 'reports'];
    const reportsDir = path.join(...consecutiveDirs);
    await fs.promises.mkdir(reportsDir, { recursive: true });
    return path.join(reportsDir, fileName);
  }

  /**
   * Gera um relatório específico para um único projeto em um determinado período.
   */
  private async generateReportForProject(project: Project, startDate: Date, endDate: Date): Promise<void> {
    this.logger.log(`Gerando relatório para o projeto: "${project.name}" (ID: ${project.id})`);
    
    // Cria um Map com a contagem de status dos casos de teste
    const statusesCountedMap = await this.countTestCasesByStatus(project.id, startDate, endDate);
    const statusesCountedString = JSON.stringify(Array.from(statusesCountedMap.entries()));

    this.logger.log(`Status coletados para o projeto "${project.name}": ${statusesCountedString}`);
    const reportData = { statuses: statusesCountedMap };

    // Gera um nome de arquivo único por projeto
    const fileName = `Relatorio-${project.name.replace(/\s/g, '_')}-${endDate.toISOString().split('T')[0]}.pdf`;
    const filePath = await this.createFilePath(fileName);
    this.logger.log(`Caminho do arquivo do relatório: ${filePath}`);
    // Passa o nome do projeto para o gerador de PDF
    let isPdfCreated = await this.pdfGeneratorService.tryGenerateTestReportPdf(filePath, reportData, startDate, endDate, project.name);

    if (!isPdfCreated) {
      this.logger.error(`Falha ao gerar o PDF para o projeto "${project.name}". O relatório não será salvo.`);
      return;
    }

    // Salva o registro do relatório no banco de dados
    const newReport = this.reportRepository.create({
      fileName,
      filePath,
      //project: project, //dá pra criar uma relação se quiser entre relatório e projeto
    });
    
    await this.reportRepository.save(newReport);
    this.logger.log(`Relatório para "${project.name}" gerado com sucesso.`);
  }
  
    private async findProjects(): Promise<Project[]> {
        const query = this.projectRepository
            .createQueryBuilder('project')
            .innerJoin(
                'project.testCases', 
                'testCase',
            )
            .distinct(true);

        const sql = query.getSql();
        this.logger.log(`SQL Gerado: ${sql}`);

        return query.getMany();
    }

  
  /**
   * Cria o arquivo PDF com os dados do relatório.
   */
  private async createPdf(filePath: string, data: any, startDate: Date, endDate: Date, projectName: string): Promise<void> {
    const chartBuffer = await this.chartService.createDonutChart(data.statuses);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filePath);
      
      doc.pipe(stream);

      doc.fontSize(25).text('Relatório Semanal de Testes', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(20).text(`Projeto: ${projectName}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text(`Período: ${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}`);
      doc.moveDown(2);

      doc.fontSize(18).text('Resumo dos Resultados:', { underline: true });
      doc.moveDown();
        
      const chartX = doc.x;
      const chartY = doc.y;
      const chartWidth = 250;
      
      doc.image(chartBuffer, chartX, chartY, {
        fit: [chartWidth, chartWidth],
        align: 'center',
        valign: 'center',
      });

      doc.end();
      
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }

    /**
   * Busca todos os relatórios disponíveis.
   */
  async findAll(): Promise<Report[]> {
    return this.reportRepository.find({ order: { generatedAt: 'DESC' } });
  }

  /**
   * Busca um relatório específico pelo ID.
   */
  async findOne(id: string): Promise<Report> {
    const report = await this.reportRepository.findOneBy({ id });
    if (!report) {
      throw new Error('Relatório não encontrado');
    }
    return report;
  }

  // /**
  //  * Busca relatórios por projeto e intervalo de datas.
  //  */
  // async findByProjectAndDateRange(projectId: string, startDate: Date, endDate: Date): Promise<Report[]> {
  //   return this.reportRepository.find({
  //     where: {
  //       project: { id: projectId },
  //       generatedAt: Between(startDate, endDate),
  //     },
  //     order: { generatedAt: 'DESC' },
  //   });
  // } 
  // AINDA NÃO IMPLEMENTADO, POIS RELATÓRIO NÃO TEM RELAÇÃO COM PROJETO
}