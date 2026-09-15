using System;
using System.Diagnostics;
using System.Net.Sockets;

namespace SubzeroLauncher
{
    class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            string projectDir = @"C:\Users\Gabriel\dev\prospector";
            bool isRunning = false;

            // Verifica se o servidor na porta 3000 já está ativo
            try
            {
                using (TcpClient client = new TcpClient("127.0.0.1", 3000))
                {
                    isRunning = true;
                }
            }
            catch
            {
                isRunning = false;
            }

            // Se não estiver rodando, inicia o servidor em segundo plano (sem janela de terminal)
            if (!isRunning)
            {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = "node.exe";
                psi.Arguments = "src\\server.js";
                psi.WorkingDirectory = projectDir;
                psi.UseShellExecute = false;
                psi.CreateNoWindow = true;
                
                try
                {
                    Process.Start(psi);
                }
                catch (Exception ex)
                {
                    // Se não achar node no PATH, tenta caminho padrão
                    psi.FileName = @"C:\Program Files\nodejs\node.exe";
                    try { Process.Start(psi); } catch {}
                }

                // Aguarda 1.5 segundo para o Express subir
                System.Threading.Thread.Sleep(1500);
            }

            // Abre o navegador padrão do Windows diretamente no painel
            try
            {
                ProcessStartInfo browserInfo = new ProcessStartInfo("http://localhost:3000")
                {
                    UseShellExecute = true
                };
                Process.Start(browserInfo);
            }
            catch {}
        }
    }
}

