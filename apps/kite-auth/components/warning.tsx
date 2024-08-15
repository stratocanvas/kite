"use client";
import { useEffect } from "react";
export default function ConsoleWarning() {
	useEffect(() => {
		const warningMessages = [
			{
				message: `

 ███████ ████████  ██████  ██████  
 ██         ██    ██    ██ ██   ██ 
 ███████    ██    ██    ██ ██████  
      ██    ██    ██    ██ ██      
 ███████    ██     ██████  ██      
                                                                           
`,
				style: "color: red; font-size: 12px; font-weight:bold;",
			},
			{
				message: "누가 여기에 무언가를 입력하거나 붙여넣으라고 시켰다면",
				style: "color: white; font-size: 16px;",
			},
			{
				message: "당장 이 창을 닫으십시오.",
				style: "color: white; font-size: 16px;",
			},
			{
				message: "해커에게 계정을 빼앗길수도 있습니다.",
				style: "color: white; font-size: 16px;",
			},
		];

		const emitWarning = () => {
			console.clear(); // Clear the console
			warningMessages.forEach((msg, index) => {
				setTimeout(() => {
					console.log(`%c${msg.message}`, msg.style);
				}, index * 1000); // Display each message at 1-second intervals
			});
		};

		emitWarning();
	}, []);

	return null;
}
