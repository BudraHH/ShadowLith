from core.logger import logger

class PromptService:
    def __init__(self):
        self.resume = "Not Provided"
        self.jd = "Not Provided"
        self._system_instruction = ""
        self._update_system_instruction()

    def update_context(self, resume=None, jd=None):
        if resume: self.resume = resume
        if jd: self.jd = jd
        self._update_system_instruction()
        logger.info("Intelligence context updated.")

    def _update_system_instruction(self):
        self._system_instruction = (
            "ROLE: You are ShadowLith, an elite technical analysis engine. \n\n"
            "CONTEXT:\n"
            f"RESUME: {self.resume}\n"
            f"JOB DESCRIPTION: {self.jd}\n\n"
            "CORE RULES:\n"
            "1. JSON ONLY: You MUST output ONLY valid JSON. NEVER include markdown (```) or conversational filler.\n"
            "2. DUAL-DESTINATION ROUTING:\n"
            "   - 'text' blocks are for YOUR VOICE. They are sent to the Chat Panel to talk to the user.\n"
            "   - All other blocks ('code', 'strategy', 'problem', 'analysis', 'interview', 'step', 'option') are technical assets for the Response Panel.\n"
            "3. CONTINUITY: When asked to update a solution (e.g., 'fix this', 'change that'), you MUST provide a conversational 'text' block AND the FULL updated technical set in the same JSON.\n"
            "4. SCHEMA:\n"
            "   {\n"
            "     'blocks': [\n"
            "        {'type': 'text'|'code'|'strategy'|'problem'|'analysis'|'interview'|'step'|'option', 'content': string, 'lang': string|null, 'label': string|null, 'time': string|null, 'space': string|null}\n"
            "     ],\n"
            "     'summary': string,\n"
            "     'time_complexity': string|null,\n"
            "     'space_complexity': string|null\n"
            "   }\n\n"
            "TONE: Use simple, natural, human English. Strictly avoid AI jargon (e.g., 'delve', 'leverage').\n"
            "PRIORITY: Technical accuracy first. Human clarity second."
        )

    def get_system_instruction(self):
        return self._system_instruction

    def build_analysis_prompt(self, mode, language, scenario, transcript=None, is_audit=False):
        """Constructs the task-specific prompt based on the UI mode."""
        if is_audit:
            return (
                "MODE: Progress Auditor\n"
                "INSTRUCTION: Compare the user's progress against the previous solution. Output a 'strategy' block with 'AUDIT RESULTS'.\n"
                "Keep it concise. Point out specific errors or give a hint."
            )
        
        if mode == "Assessment":
            if scenario == "Coding":
                return f"MODE: Assessment | SCENARIO: Coding | LANGUAGE: {language}\nOutput problem, strategy, and code blocks."
            elif scenario == "MCQ":
                return "MODE: Assessment | SCENARIO: MCQ\nOutput option block FIRST, then problem block."
            else:
                return "MODE: Assessment | SCENARIO: Video\nOutput problem and interview (professional script) blocks."
        
        # Interview Mode
        return f"MODE: {mode} | INTERVIEW TYPE: SMART (Technical/Behavioral)\nPriority #1 is the 'interview' block (the script)."

    def build_chat_prompt(self, message, is_interview_mode=False):
        if is_interview_mode:
            return f"INTERVIEWER_QUESTION: {message}\nTASK: Answer the interviewer directly."
        return f"USER_CHAT: {message}\nTASK: Process the user's request."
